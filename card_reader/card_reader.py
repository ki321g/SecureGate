"""

Required the following pip installes with Python 3.11 or above:

pip install pyscard

"""

import time
import threading
from smartcard.System import readers
from smartcard.util import toHexString
from smartcard.CardConnection import CardConnection
from smartcard.scard import SCARD_SHARE_DIRECT
from flask import Flask, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Consider using named constants for clearer code
AUTH_SUCCESS = 1
AUTH_FAIL = 0
AUTH_ERROR = 999

# Global variable 
CARD_UID = None
CARD_PRESSENT = False


#Card Action Map - Reference doc API-ACR1252U-1.17
cmdMap = {
    "mute":[0xFF, 0x00, 0x52, 0x00, 0x00],
    "unmute":[0xFF, 0x00, 0x52, 0xFF, 0x00],
    "getuid":[0xFF, 0xCA, 0x00, 0x00, 0x00],
    "firmver":[0xFF, 0x00, 0x48, 0x00, 0x00],
    "success":[0xFF, 0x00, 0x40, 0xA0, 0x04, 0x08,0x00, 0x01, 0x03],
    "invalid":[0xFF, 0x00, 0x40, 0x50, 0x04, 0x02,0x02, 0x04, 0x01],
    "engaged":[0xFF, 0x00, 0x40, 0x50, 0x04, 0x02,0x02, 0x02, 0x01],
    "auth1":[0xFF, 0x86, 0x00, 0x00, 0x05, 0x01, 0x00, 8, 0x60, 0x00],
    "auth2": [0xFF, 0x86, 0x00, 0x00, 0x05, 0x01, 0x00, 8, 0x61, 0x00],
    "data":[0xFF, 0xB0, 0x00, 8, 16] # - Required auth first...
}

@app.route('/api/screensaver-status', methods=['GET'])
def screensaver_status():
    try:
        result = subprocess.run(['xdg-screensaver', 'status'], capture_output=True, text=True)
        is_active = 'active' in result.stdout
        return jsonify({'isActive': is_active})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/start-screensaver', methods=['POST'])
def start_screensaver():
    try:
        print("Started screensaver...")
        subprocess.run(['xdg-screensaver', 'activate'])
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/read-card')
def read_card():
    global CARD_UID
    # print(f"Card data read: {CARD_UID}")  # Console log
    try:         
        if CARD_UID is not None:
            CURRENT_CARD_UID = CARD_UID
            if not CARD_PRESSENT:
                CARD_UID = None
                return jsonify({
                    'status': 'error',
                    'card_data': 'No card detected'
                })
            else:
                return jsonify({
                    'status': 'success',
                    'card_data': CARD_UID#CURRENT_CARD_UID
                })
        else:
            return jsonify({
                'status': 'error',
                'card_data': 'No card detected'
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        })

def reader_action(reader, cmd):
    # The function sends a command to the reader and handles the connection
    connection = reader.createConnection()
    protocols = [CardConnection.T0_protocol, CardConnection.T1_protocol, CardConnection.T15_protocol, CardConnection.RAW_protocol]
    for protocol in protocols:
        try:
            connection.connect(protocol=protocol, mode=SCARD_SHARE_DIRECT)
            COMMAND = cmdMap.get(cmd, cmd)
            connection.transmit(COMMAND)
            return  # Exit the function if successful
        except:
            continue  # Try the next protocol if there was an error
    print(f"Error: Couldn't execute the command {cmd} using any protocol.")

def authenticate_and_get_data(connection):
    """Handles the core logic of authentication and card data retrieval."""
    try:
        authPass = AUTH_FAIL
        
        # First authentication attempt
        COMMAND = cmdMap.get("auth1")
        if not COMMAND:
            raise ValueError("Authentication command 'auth1' not found in cmdMap.")
        data, sw1, sw2 = connection.transmit(COMMAND)

        # If the first authentication attempt fails, try the second one
        if (sw1, sw2) == (0x63, 0x0):
            COMMAND = cmdMap.get("auth2")
            if not COMMAND:
                raise ValueError("Authentication command 'auth2' not found in cmdMap.")
            data, sw1, sw2 = connection.transmit(COMMAND)
            
            if (sw1, sw2) == (0x63, 0x0):
                authPass = AUTH_FAIL
            elif (sw1, sw2) == (0x90, 0x00):
                authPass = AUTH_SUCCESS
            else:
                print(f"Unexpected status words after auth2: {sw1:02X} {sw2:02X}")
                authPass = AUTH_ERROR
        elif (sw1, sw2) == (0x90, 0x00):
            authPass = AUTH_SUCCESS
        else:
            print(f"Unexpected status words after auth1: {sw1:02X} {sw2:02X}")
            authPass = AUTH_ERROR

        # If authentication was successful, retrieve the card data
        if authPass == AUTH_SUCCESS:
            COMMAND = cmdMap.get("data")
            if not COMMAND:
                raise ValueError("Data command not found in cmdMap.")
            data, sw1, sw2 = connection.transmit(COMMAND)
            
            if (sw1, sw2) != (0x90, 0x00): 
                print("\nCould not retrieve data. Status words:", sw1, sw2)
                return None

            # print("\nRAW Card Data: %s"%data)
            # Convert the list 'data' to a bytes object
            byte_data = bytes(data)
            # print("BYTE Data: %s"%byte_data)

            # Check if all bytes are ASCII printable characters
            if all(32 <= b <= 126 for b in byte_data):
                BadgeID = byte_data.decode("ascii").strip()
            else:
                # If not all bytes are ASCII printable, handle as binary or use another method
                BadgeID = "Binary Data: " + ''.join(f"{b:02X}" for b in byte_data)
            return BadgeID
        else:
            return None

    except Exception as e:
        print(f"Error during authentication and data retrieval: {e}")
        return None
    

def card_dta_data(connection, retries=3):  
    """Retries the authentication and data retrieval process a given number of times"""
    for attempt in range(retries):
        try:
            result = authenticate_and_get_data(connection)
            if result:
                return result
        except Exception as e:
            print(f"Error with data read on attempt {attempt + 1}:", str(e))
            continue

    print("Max retries reached. Failed to retrieve data.")
    return None


def card_uid_data(connection):
    """Attempts to retrieve the UID of the card and returns it as an integer. If an error occurs, returns 0"""    
    global CARD_UID 
    UID = 0
    try:
        UIDstr = ''
        cmd = "getuid"
        COMMAND = cmdMap.get(cmd, cmd)
        data, sw1, sw2 = connection.transmit(COMMAND)
        for i in reversed(data):
            hexstring = str(hex(i))
            UIDstr +=  hexstring[2:4]
        UID = int(UIDstr,16)        
        CARD_UID = UID
        return UID
    except Exception as e:
        print(f"Error retrieving UID: {e}")
        return UID
    
def card_rev_data(connection):
    #The following gets it in a reversed format
    UID = 0
    command = [0xFF, 0xCA, 0x00, 0x00, 0x00] 
    try:
        data, sw1, sw2 = connection.transmit(command)
        if sw1 == 0x90:
            data.reverse()
            hex_string = ''.join(format(x, '02x') for x in data)
            UID = int(hex_string, 16)
        return UID
    except Exception as e:
        print(f"Error retrieving rev data: {e}")
        return UID

def card_scan(reader):
    def identify_card_type(atr):
        # Mapping of common ATRs to card types
        atr_to_type = {
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 01 00 00 00 00 6A': "MIFARE Classic 1K",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 02 00 00 00 00 69': "MIFARE Classic 4K",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 03 00 00 00 00 68': "MIFARE Ultralight",
            '3B 00': "MIFARE Ultralight C",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 04 00 00 00 00 67': "MIFARE Plus",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 05 00 00 00 00 66': "MIFARE Plus EV1",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 06 00 00 00 00 65': "MIFARE Plus EV2",
        }

        return atr_to_type.get(atr, "Unknown")
    
    global CARD_PRESSENT
    CARD_PRESSENT = False
    card_processed = False  # A flag to check if the card has been processed
    connection = reader.createConnection()
    # print("\nPlease present card...\n------------------------------------------")
    
    while True:
        try:
            connection.connect()
            CARD_PRESSENT = True
        except:
            if CARD_PRESSENT:
                # This means the card was present before but now has been removed
                CARD_PRESSENT = False
                card_processed = False  # Reset the processed flag when the card is removed
                # print("\n\nPlease present card...\n------------------------------------------")
            time.sleep(0.25)  # Add a small delay to prevent spamming connection attempts
            continue

        if not card_processed:
            try:
                # Get ATR and identify card type
                atr = toHexString(connection.getATR())
                card_type = identify_card_type(atr)
                print(f"\nCard Type: {card_type}")

                uid = card_uid_data(connection)
                rev = card_rev_data(connection)
                dta = card_dta_data(connection)
                
                # print("\nReversed UID: %s" % uid)
                # print("Data: %s" % dta)
                # print("UID: %s" % rev)
                # print("CARD_UID: %s" % CARD_UID)
                card_processed = True  # Set the flag to indicate the card has been processed
                
            except Exception as e:
                print(f"Error processing card data: {e}")

            finally:
                connection.disconnect()
        else:
            time.sleep(0.1)  # Add a small delay when waiting for the card to be removed

def get_picc_readers():
    """Returns a list of PICC readers"""
    picc_readers = [reader for reader in readers() if 'PICC' in str(reader)]
    return picc_readers

def mute_reader(reader):
    """Sends the mute command to the given reader."""
    try:
        reader_action(reader, "mute")
    except Exception as e:
        # Print a warning if unable to mute because of missing card
        if "The smart card has been removed" in str(e):
            print(f"Warning: No card detected while trying to mute reader {reader}. Continuing...")
        else:
            print(f"Error muting reader: {e}")

def unmute_reader(reader):
    """Sends the unmute command to the given reader."""
    try:
        reader_action(reader, "unmute")
    except Exception as e:
        # Print a warning if unable to mute because of missing card
        if "The smart card has been removed" in str(e):
            print(f"Warning: No card reader detected while trying to unmute reader {reader}.")
        else:
            print(f"Error unmuting reader: {e}")


def main():
    active_readers = get_picc_readers()  # Use descriptive variable name
    for reader in active_readers:
        # mute_reader(reader)
        unmute_reader(reader)
        threading.Thread(target=card_scan, args=([reader])).start()

if __name__ == '__main__':
    main()    
    app.run(host='0.0.0.0', port=3001)
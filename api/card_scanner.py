import time
import threading
from smartcard.System import readers
from smartcard.util import toHexString
from smartcard.CardConnection import CardConnection
from smartcard.scard import SCARD_SHARE_DIRECT
from shared_state import CARD_UID, CARD_PRESSENT
import sys

# Global Variables to store card data
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
    "data":[0xFF, 0xB0, 0x00, 8, 16]
}

# Connect to the card reader and send a command
def reader_action(reader, cmd):
    # The function sends a command to the reader and handles the connection
    connection = reader.createConnection()
    
    # Try different protocols to connect to the card
    protocols = [CardConnection.T0_protocol, CardConnection.T1_protocol, CardConnection.T15_protocol, CardConnection.RAW_protocol]
    
    try:
        for protocol in protocols:
            try:
                connection.connect(protocol=protocol, mode=SCARD_SHARE_DIRECT)
                COMMAND = cmdMap.get(cmd, cmd)
                connection.transmit(COMMAND)
                return  # Exit the function if successful
            except:
                continue  # Try the next protocol if there was an error
        raise Exception(f"Error: Couldn't execute the command {cmd} using any protocol.")
    except Exception as e:
        print(str(e))

# Retrieve the UID of the card & sets the global CARD_UID variable
def card_uid_data(connection):
    """Attempts to retrieve the UID of the card and returns it as an integer. If an error occurs, returns 0"""    
    # global CARD_UID 
    import shared_state  # Import the shared state module to access the global variable
    UID = 0
    try:
        UIDstr = ''
        cmd = "getuid"

        # Send the command to get the UID
        COMMAND = cmdMap.get(cmd, cmd)
        data, sw1, sw2 = connection.transmit(COMMAND) # Send the command to the card

        # Check if the command was successful
        for i in reversed(data):
            hexstring = str(hex(i))   # Convert the byte to a hex string
            UIDstr +=  hexstring[2:4] # Append the hex string to the UID string
        UID = int(UIDstr,16)          # Convert the UID string to an integer
        shared_state.CARD_UID = UID    # Set the global variable to the UID
        return UID                    # Return the UID
    except Exception as e:
        print(f"Error retrieving UID: {e}")
        return UID
    
# Scan for cards
def card_scan(reader):
    # Identify the card type based on the ATR
    def identify_card_type(atr):
        # Mapping of common ATRs to card types (extend this based on your requirements)
        atr_to_type = {
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 01 00 00 00 00 6A': "MIFARE Classic 1K",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 02 00 00 00 00 69': "MIFARE Classic 4K",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 03 00 00 00 00 68': "MIFARE Ultralight",
            '3B 00': "MIFARE Ultralight C",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 04 00 00 00 00 67': "MIFARE Plus",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 05 00 00 00 00 66': "MIFARE Plus EV1",
            '3B 8F 80 01 80 4F 0C A0 00 00 03 06 03 00 06 00 00 00 00 65': "MIFARE Plus EV2",
        }
        # Return the card type if the ATR is in the mapping, otherwise return "Unknown"
        return atr_to_type.get(atr, "Unknown")
    
    # Use the shared state global variable to indicate if a card is present
    import shared_state  # Import shared state to access the global variable
    shared_state.CARD_PRESSENT = False  # Set to indicate that no card is present

    card_processed = False  # Set to check if the card has been processed

    # Create a connection to the card
    connection = reader.createConnection()
    
    # Main loop to keep scanning for cards
    while True:
        try:
            connection.connect() # Connect to the card reader
            shared_state.CARD_PRESSENT = True
        except:
            if shared_state.CARD_PRESSENT:
                # This means the card was present before but now has been removed
                shared_state.CARD_PRESSENT = False
                card_processed = False  # Reset the processed flag when the card is removed
            time.sleep(0.25)  # Add a small delay to prevent spamming connection attempts
            continue

        # If the card is present and not processed, process the card
        if not card_processed:
            try:
                # Get the Card UID
                uid = card_uid_data(connection)
                # print("UID: %s" % uid)
                print("CARD_UID: %s" % shared_state.CARD_UID)

                card_processed = True  # Set the flag to indicate the card has been processed
                
            except Exception as e:
                print(f"Error processing card data: {e}")
            finally:
                connection.disconnect()
        else:
            time.sleep(0.1)  # Add a small delay when waiting for the card to be removed

# Get a list of PICC readers
def get_picc_readers():
    """Returns a list of PICC readers"""
    picc_readers = [reader for reader in readers() if 'PICC' in str(reader)]
    return picc_readers

# Mute the reader
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

# Unmute the reader
def unmute_reader(reader):
    """Sends the unmute command to the given reader."""
    try:
        reader_action(reader, "unmute")
    except Exception as e:
        # Print a warning if unable to unmute because of missing card
        if "The smart card has been removed" in str(e):
            print(f"Warning: No card detected while trying to unmute reader {reader}. Continuing...")
        else:
            print(f"Error unmuting reader: {e}")

# Start the card scanner
def start_scanner():
    active_readers = get_picc_readers()
    for reader in active_readers:
        unmute_reader(reader)
        threading.Thread(target=card_scan, args=([reader])).start()

if __name__ == '__main__':
    start_scanner()

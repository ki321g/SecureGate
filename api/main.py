from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
from card_scanner import start_scanner
from shared_state import CARD_UID, CARD_PRESSENT
import subprocess
import threading
import uvicorn

app = FastAPI()

# Allow CORS for all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

##########################################
#          API Routes:  General          #
##########################################

@app.get("/")
def index():
    # Assuming you have a 'templates' folder in your project directory
    html_file = Path("templates/index.html")
    return FileResponse(html_file)

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

#############################################
#          API Routes: Card Reader          #
#############################################
@app.get('/card_uid')
def read_card():
    import shared_state # Import shared state module to access the global variable
    try:
        if shared_state.CARD_UID is not None:
            if not shared_state.CARD_PRESSENT:
                return {
                    'status': 'error',
                    'message': 'No card detected'
                }
            return {
                'status': 'success',
                'message': 'Card UID retrieved successfully',
                'card_uid': shared_state.CARD_UID
            }
        return {
            'status': 'error',
            'message': 'No card detected'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

@app.post('/reset_card_uid/{new_uid}')
def reset_card_uid(new_uid: str):
    import shared_state
    try:
        print(f"Setting new card UID to: {new_uid}")  # Log the incoming value
        shared_state.CARD_UID = new_uid
        print(f"Successfully set CARD_UID to: {shared_state.CARD_UID}")  # Log the result
        return {
            'status': 'success',
            'message': f'Card UID set to {new_uid}' #,
            # 'card_uid': shared_state.CARD_UID
        }
    except Exception as e:
        print(f"Error occurred while setting card UID: {str(e)}")  # Log any errors
        return {
            'status': 'error',
            'message': f'Failed to set Card UID: {str(e)}'
        }


#############################################
#          API Routes: Screen Saver         #
#############################################
@app.get('/screensaver-status')
def screensaver_status():
    try:
        result = subprocess.run(['xdg-screensaver', 'status'], capture_output=True, text=True)
        is_active = 'active' in result.stdout
        print(f"ScreenSaver is_active: {is_active}")
        return {
            'status': 'success',
            'isActive': is_active
        }
    except Exception as e:
        return {'error': str(e)}, 500

@app.post('/start_screensaver/{new_uid}')
def start_screensaver():
    try:
        print("Started screensaver...")
        subprocess.run(['xdg-screensaver', 'activate'])
        return {'status': 'success'}
    except Exception as e:
        return {'error': str(e)}, 500


##############################################
#                  __main__                  #
#############################################
if __name__ == '__main__':
    # Start card scanner in a separate thread
    scanner_thread = threading.Thread(target=start_scanner)
    scanner_thread.daemon = True
    scanner_thread.start()

    # Start FastAPI with uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)
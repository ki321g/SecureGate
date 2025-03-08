#!/usr/bin/env python3

from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.security.api_key import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

from pathlib import Path
from pydantic import BaseModel
from enum import Enum
from typing import Optional
from card_scanner import start_scanner
from control_door import toggle_door as control_toggle_door
from control_door import get_status as get_door_status
from control_door import open_door as control_open_door
from control_door import close_door as control_close_door
from shared_state import CARD_UID, CARD_PRESSENT
import subprocess
import threading
import uvicorn
import os
import re # Using for String replacement
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Key settings
API_KEY = os.getenv("API_KEY")  # Default is for development only
API_KEY_NAME = "X-API-Key"  # Header name

# Define API key security scheme
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Define schema models
class DoorAction(str, Enum):
    open = "open"
    close = "close"
    toggle = "toggle"

class DoorActionRequest(BaseModel):
    action: DoorAction

class CardResponse(BaseModel):
    status: str
    message: str
    card_uid: str = None

class ApiResponse(BaseModel):
    status: str
    message: str
    
# API Key dependency
async def get_api_key(api_key: str = Depends(api_key_header)):
    if not api_key or api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid or missing API Key"
        )
    return api_key

# Create FastAPI app with metadata
app = FastAPI(
    title="SecureGateAPI",
    description="API for controlling secure access system with RFID card reader and door controls",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Mount static files if needed
app.mount("/static", StaticFiles(directory="static"), name="static")

# Allow CORS for all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set the OpenAPI schema version
# I had to do this in order to allow me to develop a custom Swagger UI 
# for the API documentation.
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema["openapi"] = "3.0.2"
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Set the custom OpenAPI schema function
app.openapi = custom_openapi

##########################################
#   API Routes:  Custom Docs Endpoint    #
##########################################
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_docs():
    """
    Returns custom Swagger UI documentation using an HTML template file.
    """
    template_path = Path("templates/swagger-ui.html")
    
    # Read the HTML template file
    with open(template_path, "r") as file:
        html_content = file.read()
    
    # Replace placeholders with actual values
    html_content = html_content.replace("{{title}}", app.title)
    html_content = html_content.replace("{{openapi_url}}", app.openapi_url)
    
    # Return the processed HTML
    return HTMLResponse(content=html_content)

##########################################
#           API Routes:  Index           #
##########################################

@app.get("/", tags=["API Index Page"], include_in_schema=False )
def load_api_index_page():
    """
    Returns the main page of the application.
    """
    html_file = Path("templates/index.html")
    return FileResponse(html_file)

#############################################
#          API Routes: Card Reader          #
#############################################
@app.get('/card/uid', tags=["Card Reader"], response_model=CardResponse, dependencies=[Depends(get_api_key)])
def check_for_card_scan():
    """
    Read the current RFID card UID if a card is present.
    Requires API Key authentication.
    
    Returns:
    - Card UID information or a message indicating no card is detected
    """
    import shared_state # Import shared state module to access the global variable
    try:
        if shared_state.CARD_UID is not None:
            if not shared_state.CARD_PRESSENT:
                return {
                    'status': 'nocard',
                    'message': 'No card detected'
                }
            return {
                'status': 'success',
                'message': 'Card UID retrieved successfully',
                'card_uid': shared_state.CARD_UID
            }
        return {
            'status': 'nocard',
            'message': 'No card detected'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

@app.post('/reset_card_uid/{new_uid}', tags=["Card Reader"], response_model=ApiResponse, dependencies=[Depends(get_api_key)])
def reset_card_uid(new_uid: str):
    """
    Reset card UID to a new value.
    Requires API Key authentication.
    
    Parameters:
    - **new_uid**: New UID value to set for the card
    """
    import shared_state
    try:
        print(f"Setting new card UID to: {new_uid}")  # Log the incoming value
        shared_state.CARD_UID = new_uid
        print(f"Successfully set CARD_UID to: {shared_state.CARD_UID}")  # Log the result
        return {
            'status': 'success',
            'message': f'Card UID set to {new_uid}'
        }
    except Exception as e:
        print(f"Error occurred while setting card UID: {str(e)}")  # Log any errors
        return {
            'status': 'error',
            'message': f'Failed to set Card UID: {str(e)}'
        }

#############################################
#          API Routes: Door Control         #
#############################################
@app.post('/door', tags=["Door Control"], response_model=ApiResponse)
def set_door_state(
    action_request: DoorActionRequest = Body(..., example={"action": "open"}),
    api_key: str = Depends(get_api_key)
):
    """
    Control the door with the specified action.
    Requires API Key authentication.
    
    Parameters:
    - **action**: Action to perform on the door (open, close, or toggle)
    
    Returns:
    - Success or error message
    """
    try:
        action = action_request.action
        if action == DoorAction.open:
            control_open_door()
            message = 'Door opened successfully'
        elif action == DoorAction.close:
            control_close_door()
            message = 'Door closed successfully'
        elif action == DoorAction.toggle:
            control_toggle_door()
            message = 'Door toggled successfully'
        
        return {
            'status': 'success',
            'message': message
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to {action} door: {str(e)}'
        }

@app.get('/door/status', tags=["Door Control"], response_model=ApiResponse)
def check_door_status(api_key: str = Depends(get_api_key)):
    """
    Get the current status of the door (open or closed).
    Requires API Key authentication.
    
    Returns:
    - Current door status
    """
    try:
        status = get_door_status()
        return {
            'status': 'success',
            'message': status
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to get door status: {str(e)}'
        }

# For backward compatibility (can be removed later)
@app.get('/door/open', tags=["Door Control"], response_model=ApiResponse, deprecated=True)
def open_door(api_key: str = Depends(get_api_key)):
    """
    Open the door (deprecated, use POST /door with action=open instead).
    Requires API Key authentication.
    """
    try:
        control_open_door()
        return {
            'status': 'success',
            'message': 'Door opened successfully'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to open door: {str(e)}'
        }

@app.get('/door/close', tags=["Door Control"], response_model=ApiResponse, deprecated=True)
def close_door(api_key: str = Depends(get_api_key)):
    """
    Close the door (deprecated, use POST /door with action=close instead).
    Requires API Key authentication.
    """
    try:
        control_close_door()
        return {
            'status': 'success',
            'message': 'Door closed successfully'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to close door: {str(e)}'
        }

@app.get('/door/toggle', tags=["Door Control"], response_model=ApiResponse, deprecated=True)
def toggle_door(api_key: str = Depends(get_api_key)):
    """
    Toggle the door state (deprecated, use POST /door with action=toggle instead).
    Requires API Key authentication.
    """
    try:
        control_toggle_door() 
        return {
            'status': 'success',
            'message': 'Door toggled successfully'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to toggle door: {str(e)}'
        }

##########################################
#          API Routes:  General          #
##########################################

@app.get("/items/{item_id}", tags=["General"], include_in_schema=False)
def read_item(item_id: int, q: str = None, api_key: str = Depends(get_api_key)):
    """
    Get item by ID with optional query parameter.
    Requires API Key authentication.
    
    Parameters:
    - **item_id**: ID of the item to retrieve
    - **q**: Optional query string
    """
    return {"item_id": item_id, "q": q}

#############################################
#          API Routes: Screen Saver         #
#############################################
@app.get('/screensaver-status', tags=["Screensaver"], response_model=ApiResponse, include_in_schema=False)
def screensaver_status(api_key: str = Depends(get_api_key)):
    """
    Get the current status of the screensaver (active or inactive).
    Requires API Key authentication.
    """
    try:
        result = subprocess.run(['xdg-screensaver', 'status'], capture_output=True, text=True)
        is_active = 'active' in result.stdout
        print(f"ScreenSaver is_active: {is_active}")
        return {
            'status': 'success',
            'message': 'Screensaver status retrieved',
            'isActive': is_active
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to get screensaver status: {str(e)}'
        }

@app.post('/start-screensaver', tags=["Screensaver"], response_model=ApiResponse, include_in_schema=False)
def start_screensaver(api_key: str = Depends(get_api_key)):
    """
    Activate the screensaver.
    Requires API Key authentication.
    """
    try:
        print("Started screensaver...")
        subprocess.run(['xdg-screensaver', 'activate'])
        return {
            'status': 'success',
            'message': 'Screensaver activated successfully'
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to activate screensaver: {str(e)}'
        }

##############################################
#                  __main__                  #
##############################################
if __name__ == '__main__':
    # Start card scanner in a separate thread
    scanner_thread = threading.Thread(target=start_scanner)
    scanner_thread.daemon = True
    scanner_thread.start()

    # Start FastAPI with uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)

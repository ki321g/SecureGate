#!/usr/bin/env python3
from gpiozero import OutputDevice
import time
import sys

# GPIO pin for door control
DOOR_PIN = 23

# Create an output device connected to GPIO23
door = OutputDevice(DOOR_PIN, initial_value=False)

## toggle_door function 
# Toggle the MgLock - turning it on then back off
def toggle_door():
    print(f"Toggling MagLock on GPIO{DOOR_PIN}...")
    door.on()
    time.sleep(3)  # Keep the pin HIGH for 3 second
    door.off()
    print("Toggle Complete - MagLock Engaged")

## open_door function
# Turn the MagLock off (open the door)
def open_door():
    print(f"Opening door (releasing MagLock) on GPIO{DOOR_PIN}...")
    door.on()
    print("Door opened - MagLock Released")

## close_door function
# Turn the MagLock on (close the door)
def close_door():
    print(f"Closing door (engaging MagLock) on GPIO{DOOR_PIN}...")
    door.off()
    print("Door closed - MagLock Engaged")

## get_status function
# Get the current status of the MagLock
def get_status():
    return "MagLock Released" if door.value else "MagLock Engaged"

# Main function
if __name__ == "__main__":
    try:
        command = sys.argv[1] if len(sys.argv) > 1 else "open"
        
        if command == "open":
            toggle_door()
        elif command == "status":
            print(f"GPIO{DOOR_PIN} status: {get_status()}")
        else:
            print(f"Unknown command: {command}")
            print("Available commands: open, status")
        
    # except KeyboardInterrupt:
    #     print("\nProgram stopped by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        pass

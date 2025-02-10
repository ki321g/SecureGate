/*
 * deviceContext.jsx
 * 
 * This file contains the deviceContext, which is used to store the user data.
 * 
 * Video Tutorial: https://youtu.be/tnt2y7D3V9o
 */

import React, { useState } from 'react';

// Initial devices state as an array
const initalDevicesState = [
    {
        deviceid: '00112233',
        device_name: 'USB Camera',
        description: 'Main Entrance Camera',
        created_at: '2025-02-02T11:11:11.000Z',
    },
    {
        deviceid: '00112234',
        device_name: 'RFID Reader',
        description: 'Front Door Access',
        created_at: '2025-02-02T11:11:11.000Z',
    }
];

// Create the device context
export const deviceContext = React.createContext();

/*  
 * DeviceContextProvider is a component that provides the user context to its children.
 * It takes in a user object and provides it to its children through the user context.
 */
const DeviceContextProvider = ({ children }) => {
    const [devices, setDevices] = useState(initalDevicesState);

    return (
        <deviceContext.Provider value={{ devices, setDevices }}>
            {children}
        </deviceContext.Provider>
    );
}

// Export the UserContextProvider
export default DeviceContextProvider;
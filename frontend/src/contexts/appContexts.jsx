import React from 'react';
import UserContextProvider from './userContext';
import DeviceContextProvider from './deviceContext';
import CameraContextProvider from './cameraContext';
import CardUidContextProvider from './cardUidContext';

const AppContextProvider = ({ children }) => {
    return (
        <CameraContextProvider>
            <CardUidContextProvider>
                <UserContextProvider>
                    <DeviceContextProvider>
                        {children}
                    </DeviceContextProvider>
                </UserContextProvider>
            </CardUidContextProvider>
        </CameraContextProvider>
    );
}

export default AppContextProvider;
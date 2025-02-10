import React from 'react';
import UserContextProvider from './userContext';
import DeviceContextProvider from './deviceContext';
import CameraContextProvider from './cameraContext';
import CardUidContextProvider from './cardUidContext';
import DataContextProvider from './dataContext';

const AppContextProvider = ({ children }) => {
    return (
        <DataContextProvider>
            <CameraContextProvider>
                <CardUidContextProvider>
                    <UserContextProvider>
                        <DeviceContextProvider>
                            {children}
                        </DeviceContextProvider>
                    </UserContextProvider>
                </CardUidContextProvider>
            </CameraContextProvider>
        </DataContextProvider>
    );
}

export default AppContextProvider;
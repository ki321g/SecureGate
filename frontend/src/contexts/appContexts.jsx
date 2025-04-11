//https://youtu.be/tnt2y7D3V9o?si=pCTLEqpv5Tja0Nm9

import React from 'react';
import UserContextProvider from './userContext';
import DeviceContextProvider from './deviceContext';
import CameraContextProvider from './cameraContext';
import CardUidContextProvider from './cardUidContext';
import DataContextProvider from './dataContext';
import AuthContextProvider from './authContext';

const AppContextProvider = ({ children }) => {
    return (
        <AuthContextProvider>
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
        </AuthContextProvider>
    );
}

export default AppContextProvider;
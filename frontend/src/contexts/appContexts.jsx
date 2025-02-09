import React from 'react';
import UserContextProvider from './userContext';
import DeviceContextProvider from './deviceContext';

const AppContextProvider = ({ children }) => {
    return (
        <UserContextProvider>
            <DeviceContextProvider>
                {children}
            </DeviceContextProvider>
        </UserContextProvider>
    );
}

export default AppContextProvider;
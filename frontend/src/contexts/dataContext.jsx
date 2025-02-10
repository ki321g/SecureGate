import React, { createContext, useState, useContext } from 'react';

// Create the context.
const DataContext = createContext(null);

const initalDevicesState = [];
const initalRolesState = [];
const initalRolesToDevicesState = [];

// Custom hook for easy access to the context.
export const useData = () => {
    return useContext(DataContext);
};

// Provider component.
const DataContextProvider = ({ children }) => {
    const [devices, setDevices] = useState(initalDevicesState);
    const [roles, setRoles] = useState(initalRolesState);
    const [roleToDevices, setRolesToDevices] = useState(initalRolesToDevicesState);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContextProvider;


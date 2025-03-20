import React, { createContext, useState, useContext } from 'react';

// Create the context.
const DataContext = createContext(null);

const initalDevicesState = [];
const initalRolesState = [];
const initalRolesToDevicesState = [];
const initalUsersState = [];

// Custom hook for easy access to the context.
export const useData = () => {
    return useContext(DataContext);
};

// Provider component.
const DataContextProvider = ({ children }) => {
    const [users, setUsers] = useState(initalUsersState);
    const [devices, setDevices] = useState(initalDevicesState);
    const [roles, setRoles] = useState(initalRolesState);
    const [roleToDevices, setRolesToDevices] = useState(initalRolesToDevicesState);

    const contextValue = {
        users,
        setUsers,
        devices,
        setDevices,
        roles,
        setRoles,
        roleToDevices,
        setRolesToDevices
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContextProvider;


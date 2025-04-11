/*
 * UserContext.jsx
 * 
 * This file contains the UserContext, which is used to store the user data.
 * 
 * Video Tutorial: https://youtu.be/tnt2y7D3V9o
 */

import React, { useState, useContext } from 'react';

// Initial user state
const initalUserState = {
    uid: '123456',
    first_name: 'firstName',
    last_name: 'lastName',
    email: 'firstName@lastName.com',
    password: '3322',
    phone_number: '1234567890',
    role_id: '1234',
    card_uid: '690402134',
    user_picture: null,
    last_seen_at: '2025-01-31T16:02:00.000Z',
    created_at: '2025-01-01T00:00:00.000Z',
};

// Create the user context
export const userContext = React.createContext();

// Custom hook for easy access to the context.
export const useUser = () => {
    return useContext(userContext);
};


/*  
 * UserContextProvider is a component that provides the user context to its children.
 * It takes in a user object and provides it to its children through the user context.
 */
const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(initalUserState);

    return (
        <userContext.Provider value={{ user, setUser }}>
            {children}
        </userContext.Provider>
    );
}

// Export the UserContextProvider
export default UserContextProvider;
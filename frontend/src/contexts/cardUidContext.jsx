/*  
 * CardUidContextProvider.jsx
 * 
 * This file contains the CardUidContext, which is used to store the card uid.
 * 
 * Video Tutorial: https://youtu.be/tnt2y7D3V9o
 */

import React, { createContext, useRef, useContext, useState } from 'react';

// Initial user state
const initalCardUIDState = 'noCardUID';

// Create the user context
export const cardUidContext = React.createContext();

// Custom hook for easy access to the context.
export const useCardUID = () => {
    return useContext(cardUidContext);
};

/*
 * CardUidContextProvider 
 */
const CardUidContextProvider = ({ children }) => {
    const [cardUID, setCardUID] = useState(initalCardUIDState);

    return (
        <cardUidContext.Provider value={{ cardUID, setCardUID }}>
            {children}
        </cardUidContext.Provider>
    );
}

// Export the CardUidContextProvider
export default CardUidContextProvider;
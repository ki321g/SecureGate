import React, { createContext, useRef, useContext } from 'react';

// Create the context.
const CameraContext = createContext(null);

// No default value needed since we use useRef.

// Custom hook for easy access to the context.
export const useCamera = () => {
    return useContext(CameraContext);
};

// Provider component.
const CameraContextProvider = ({ children }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const contextValue = {
        webcamRef,
        canvasRef,
    };

    return (
        <CameraContext.Provider value={contextValue}>
            {children}
        </CameraContext.Provider>
    );
};

export default CameraContextProvider;


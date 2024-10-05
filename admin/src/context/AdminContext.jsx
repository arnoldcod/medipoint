import { createContext, useState, useEffect } from "react";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    // Initialize the state with a function to avoid accessing localStorage twice
    const [aToken, setAToken] = useState(() => localStorage.getItem('aToken') || '');

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    // Update localStorage whenever aToken changes
    useEffect(() => {
        if (aToken) {
            localStorage.setItem('aToken', aToken);
        } else {
            localStorage.removeItem('aToken');  // Clear if token is empty
        }
    }, [aToken]);

    const value = {
        aToken, 
        setAToken,
        backendURL
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
}

export default AdminContextProvider;

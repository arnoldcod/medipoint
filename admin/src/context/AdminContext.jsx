import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    // Initialize the state with a function to avoid accessing localStorage twice
    const [aToken, setAToken] = useState(() => localStorage.getItem('aToken') || '');
    const [doctors, setDoctors] = useState([])

    const backendURL = import.meta.env.VITE_BACKEND_URL;

    const getAllDoctors = async ()=> {
        try {

            const {data} = await axios.post(backendURL + '/api/admin/all-doctors', {}, {headers: {aToken}})
            if(data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors)
            } else {
                toast.error(data.message)
            }

            }
        catch (error) {
            console.error(error);
            toast.error(error.message)
        }
        
    }


    const value = {
        aToken, 
        setAToken,
        backendURL,
        getAllDoctors,
        doctors,
        setDoctors,
        toast,
        setDocImg: false,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
}


export default AdminContextProvider;

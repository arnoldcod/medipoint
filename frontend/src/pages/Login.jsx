// eslint-disable-next-line no-unused-vars
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const { backendURL, token, setToken } = useContext(AppContext);
    const  navigate = useNavigate()

    // Changed initial state to match the text case in the rest of the component
    const [state, setState] = useState("Sign Up");
    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: ""
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault(); // Fixed typo: prevenntDefault -> preventDefault
        
        const endpoint = state === 'Sign Up' 
            ? '/api/user/register'
            : '/api/user/login';
        
        const payload = state === 'Sign Up'
            ? formData
            : { email: formData.email, password: formData.password };

        try {
            const { data } = await axios.post(`${backendURL}${endpoint}`, payload);
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                toast.success(`Successfully ${state === 'Sign Up' ? 'registered' : 'logged in'}!`);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    const toggleState = () => setState(prev => prev === "Sign Up" ? "Login" : "Sign Up");


    useEffect(() => {
        if (token) {
            navigate('/')
        }
    },[navigate, token]);


    return (
        <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
            <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
                <p className="text-2xl font-semibold">
                    {state === "Sign Up" ? "Create Account" : "Login"}
                </p>
                <p>
                    Please {state.toLowerCase()} to book appointment
                </p>
                {state === "Sign Up" && (
                    <div className="w-full">
                        <p>Full Name</p>
                        <input
                            className="border border-zinc-300 rounded w-full p-2 mt-1"
                            type="text"
                            name="name"
                            onChange={handleInputChange}
                            value={formData.name}
                            required
                        />
                    </div>
                )}

                <div className="w-full">
                    <p>Email</p>
                    <input
                        className="border border-zinc-300 rounded w-full p-2 mt-1"
                        type="email"
                        name="email"
                        onChange={handleInputChange}
                        value={formData.email}
                        required
                    />
                </div>
                <div className="w-full">
                    <p>Password</p>
                    <input
                        className="border border-zinc-300 rounded w-full p-2 mt-1"
                        type="password"
                        name="password"
                        onChange={handleInputChange}
                        value={formData.password}
                        required
                    />
                </div>
                <button type="submit" className="bg-primary text-white w-full py-2 rounded-md text-base">
                    {state === "Sign Up" ? "Create Account" : "Login"}
                </button>
                <p>
                    {state === "Sign Up" ? "Already have an account? " : "Don't have an account? "}
                    <span
                        onClick={toggleState}
                        className="text-primary underline cursor-pointer"
                    >
                        {state === "Sign Up" ? "Login here" : "Click here"}
                    </span>
                </p>
            </div>
        </form>
    );
};

export default Login;
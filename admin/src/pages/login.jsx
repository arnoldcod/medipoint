import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/adminContext';
import axios from 'axios';
import { toast } from 'react-toastify'; // Make sure this is imported

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAToken, backendURL } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
     
    try {
      if (!backendURL) {
        throw new Error('Backend URL is not configured');
      }

      if (state === 'Admin') {
        const response = await axios.post(`${backendURL}/api/admin/login`, { 
          email, 
          password 
        });
        
        const { data } = response;
        
        if (data.success) {
          localStorage.setItem('aToken', data.token);
          setAToken(data.token);
          toast.success('Login successful!');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } else {
        // Handle doctor login if needed
        toast.error('Doctor login not implemented yet');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with an error
        toast.error(error.response.data.message || 'Login failed');
      } else if (error.request) {
        // Request was made but no response received
        toast.error('No response from server. Please check your connection.');
      } else {
        // Other errors
        toast.error(error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'>
          <span className='text-primary'>{state}</span> Login
        </p>
        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="email"  
            required
          />
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password}  
            className='border border-[#DADADA] rounded w-full p-2 mt-1' 
            type="password"  
            required
          />
        </div>
        <button 
          className='bg-primary text-white w-full py-2 rounded-md text-base'
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {state === 'Admin' ? (
          <p>Doctor Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Doctor')}>Click here</span></p>
        ) : (
          <p>Admin Login? <span className='text-primary underline cursor-pointer' onClick={() => setState('Admin')}>Click here</span></p>
        )}
      </div>
    </form>
  );
};

export default Login;




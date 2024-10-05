import React, { useContext } from 'react'
import Login from './pages/login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/adminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App = () => {


  const {aToken} = useContext(AdminContext)

  return aToken? (
    <div className='bg-[#F8F9FD'>
      <ToastContainer />
      <Navbar />
      <div className='flex items-start'>
        <Sidebar />
        
      </div>
    </div>
  ) : (
    <>
     <Login />
    <ToastContainer />
    </>
  )
}

export default App

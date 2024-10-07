import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect ( ()=> {
    if (aToken) {
      getAllDoctors()  // Fetch all doctors when component mounts   
    }
  }, [aToken])


  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll '>
      <h1 className='text-lg font-medium'>All Doctors</h1>
      <div className='w-full flex flex-wrap gap-4 pt-5 gap-y-6'>
        {
          doctors.map((doc, index) => (
            <div className='border border-indigo-200 rounded-xl max-w-56- overflow-hidden cursor-pointer group' key={index}>
              <img className='bg-indigo-50 group-hover:bg-primary transition-all duration-500' src={doc.image} alt="" />
              <div className='p-4'>
              <p className='text-neutral-800 text-lg font-medium'>{doc.name}</p>
              <p className='text-zinc-600 text-sm'>{doc.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input onChange={()=> changeAvailability(doc._id)} type="checkbox" checked={doc.available}  defaultChecked />
                <p>Available</p>
              </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DoctorsList

import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors } = useContext(AdminContext)

  useEffect ( ()=> {
    if (aToken) {
      getAllDoctors()  // Fetch all doctors when component mounts   
    }
  }, [aToken])


  return (
    <div className='m-5 max-h-[90vh] overflow-y-scroll '>
      <h1>All Doctors</h1>
      <div>
        {
          doctors.map((doc, index) => (
            <div key={index}>
              <img src={doc.image} alt="" />
              <div>
              <p>{doc.name}</p>
              <p>{doc.speciality}</p>
              <div>
                <input type="checkbox" checked={doc.available}  defaultChecked />
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

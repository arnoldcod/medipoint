import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/adminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState(' General Physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')


  const { backendURL, aToken } = useContext(AdminContext)

  

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      
      if (!docImg) {
        return toast.error('Image not selected')
      }

      const formData = new FormData();

      formData.append('image', docImg);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('experience', experience);
      formData.append('fees', Number(fees));
      formData.append('about', about);
      formData.append('speciality', speciality);
      formData.append('degree', degree);
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

      //console log formData
      formData.forEach((value, key)=> {
        console.log(`${key}: ${value}`);
      })

      const {data} = await axios.post(backendURL + '/api/admin/add-doctor', formData, {headers:{aToken}})

      if(data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setEmail('')
        setPassword('')
        setExperience('')
        setFees('')
        setAbout('')
        setSpeciality('')
        setDegree('')
        setAddress1('')
        setAddress2('')
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }

    // Add doctor data to database
  }


  return (
    
<form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'> Add Doctor</p>

      <div className='bg-white px-8 py-8 border rounnded w-full max-w-4xl max-h-[80vh] overflow-y-scroll '>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={ docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e)=> setDocImg(e.target.files[0])} type="file" id='doc-img' hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Name</p>
              <input onChange={(e)=> setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Email</p>
              <input onChange={(e)=> setEmail(e.target.value)} value={email}  className='border rounded px-3 py-2' type="email" placeholder='Email' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Password</p>
              <input onChange={(e)=> setPassword(e.target.value)} value={password}  className='border rounded px-3 py-2' type="password" placeholder='Password' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Experience</p>
              <select onChange={(e)=> setExperience(e.target.value)} value={experience}  className='border rounded px-3 py-2' name="" id="">
                <option value="">Select Experience</option>
                <option value="1-2 years">1-2 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Fees</p>
              <input onChange={(e)=> setFees(e.target.value)} value={fees}  className='border rounded px-3 py-2' type="number" placeholder='Fees' required />
            </div>

          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Speciality</p>
              <select onChange={(e)=> setSpeciality(e.target.value)} value={speciality}  className='border rounded px-3 py-2' name="" id="">
                <option value="">Select Speciality</option>
                <option value="General physician">General physician</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Gastroenterology">Gastroenterology</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Education</p>
              <input onChange={(e)=> setDegree(e.target.value)} value={degree}  className='border rounded px-3 py-2' type="text" placeholder='Education' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Address</p>
              <input onChange={(e)=> setAddress1(e.target.value)} value={address1}  className='border rounded px-3 py-2' type="text" placeholder='address 1' required />
              <input onChange={(e)=> setAddress2(e.target.value)} value={address2}  className='border rounded px-3 py-2' type="text" placeholder='address 2' required />
            </div>

          </div>
        </div>

        <div>
          <p className='mt-4 mb-2'>About Doctor</p>
          <textarea onChange={(e)=> setAbout(e.target.value)} value={about}  className='w-full px-4 pt-2 border rounded'  placeholder='write about doctor' rows={5} required />
        </div>

        <button type='submit' className='bg-primary px-10 py-3 mt-3 text-white rounded-full '>Add doctor</button>


      </div>

    </form>
    
  )
}

export default AddDoctor

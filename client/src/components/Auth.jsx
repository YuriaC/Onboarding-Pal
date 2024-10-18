import React from 'react'
import { Outlet } from 'react-router-dom'
import '../pages/auth.css'

const Auth = () => {
  return (
    <div className='authContainer'>
        <Outlet />
    </div>
  )
}

export default Auth
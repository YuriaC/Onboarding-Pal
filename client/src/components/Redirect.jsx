import { getCookieValue } from '../helpers/HelperFunctions'
import { Navigate } from 'react-router-dom'

const Redirect = () => {
  const cookie = getCookieValue('auth_token')
  if(cookie) return <Navigate to={'/not-found'} />
  return (
    <Navigate to={'/login'} />
  )
}

export default Redirect
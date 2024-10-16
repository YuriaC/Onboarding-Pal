import './App.css'
import { Onboarding, Housing, Login, Registration, HousingMgmt } from './pages'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './components/Auth';
import Guard from './components/Guard';
import Redirect from './components/Redirect';



function App() {

  return (

      <BrowserRouter>
        <Routes>
          <Route path='/auth' element={<Auth />}>
            <Route path='login' element={<Login />} />
            <Route path="registration" element={<Registration />} />
          </Route>

          <Route element={<Guard />}>
            <Route path="/" element={<Onboarding />} />
            <Route path="/housingmgmt" element={<HousingMgmt />} />
            <Route path="/housing" element={<Housing />} />
          </Route>


          <Route path="*" element={<Redirect />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App

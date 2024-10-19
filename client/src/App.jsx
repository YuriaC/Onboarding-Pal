import './App.css'
import { Onboarding, Housing, Login, Registration, HousingMgmt, Personal } from './pages'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './components/Auth';
import Guard from './components/Guard';
import Redirect from './components/Redirect';
import AddHouse from './pages/AddHouse';
import Navbar from './components/Navbar';

import HRGuard from './components/HRGuard';
import HRNavbar from './components/HRNavbar';
import EmployeeProfiles from './pages/EmployeeProfiles';
import Hiring from './pages/Hiring';

function App() {

  return (

      <BrowserRouter>
        <Routes>
          <Route path='/auth' element={<Auth />}>
            <Route path='login' element={<Login />} />
            <Route path="registration" element={<Registration />} />
          </Route>

          <Route element={<Guard />}>
            <Route element={<Navbar />}>
              <Route path="/" element={<Onboarding />} />
              <Route path="/housingmgmt" element={<HousingMgmt />} />
              <Route path="/housing" element={<Housing />} />
              <Route path="/personal" element={<Personal />} />
            </Route>
          </Route>

          <Route path='/hr' element={<HRGuard />}>
            <Route element={<HRNavbar />}>
              <Route path='employeeprofiles' element={<EmployeeProfiles />} />
              <Route path='hiring' element={<Hiring />}/>
            </Route>
          </Route>

          {/* For testing */}
          <Route path='/managehousing' element={<HousingMgmt />} />
          <Route path='/addhouse' element={<AddHouse />} />
          <Route path='/onboarding' element={<Onboarding />} />
          <Route path="/personalTest" element={<Personal />} />

          <Route path="*" element={<Redirect />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App

import './App.css'
import { Onboarding, Housing, Login, Registration, HousingMgmt, Personal } from './pages'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './components/Auth';
import Guard from './components/Guard';
import HRGuard from './components/HRGuard';

import Redirect from './components/Redirect';
import AddHouse from './pages/AddHouse';
import Navbar from './components/Navbar';

import HRNavbar from './components/HRNavbar';
import EmployeeProfiles from './pages/EmployeeProfiles';
import EmployeeDetail from './pages/EmployeeDetail';
import Hiring from './pages/Hiring';

import VisaStatusHR from './pages/VisaStatusHR';
import VisaStatusEmployees from './pages/VisaStatusEmployees';

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
              <Route path="/housing" element={<Housing />} />
              <Route path="/personal" element={<Personal />} />
              <Route path='/visastatusemployees' element={<VisaStatusEmployees />} />
            </Route>
          </Route>

          <Route path='/hr' element={<HRGuard />}>
            <Route element={<HRNavbar />}>
              <Route path='employeeprofiles' element={<EmployeeProfiles />} />
              <Route path='employeeprofiles/:employeeId' element={<EmployeeDetail />}/>
              <Route path='hiring' element={<Hiring />}/>
              <Route path="housingmgmt" element={<HousingMgmt />} />
              <Route path='visastatushr' element={<VisaStatusHR />}/>
            </Route>
          </Route>

          {/* For testing */}
          <Route path='/managehousing' element={<HousingMgmt />} />
          <Route path='/addhouse' element={<AddHouse />} />
          <Route path='/onboarding' element={<Onboarding />} />
          <Route path="/personalTest" element={<Personal />} />

          <Route path='/visa' element={<VisaStatusEmployees />} />


          <Route path="*" element={<Redirect />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App

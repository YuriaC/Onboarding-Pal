import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Onboarding from './pages/Onboarding';
import Housing from './pages/Housing';
import Personal from './pages/Personal';
import EmployeeProfiles from './pages/EmployeeProfiles';
import EmployeeDetail from './pages/EmployeeDetail';
import Hiring from './pages/Hiring';
import VisaStatusHR from './pages/VisaStatusHR';
import VisaStatusEmployees from './pages/VisaStatusEmployees';
import HousingMgmt from './pages/HousingMgmt';
// Guards
import NotFound from './pages/NotFound';
import LoginGuard from './components/guards/LoginGuard';
import RoleGuard from './components/guards/RoleGuard';
import HouseDetails from './pages/HouseDetails';
import AddHouse from './pages/AddHouse';
import Application from './pages/Application';
const RoutesComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unprotected Routes */}
      
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Registration />} />


        {/* Protected Routes - requires login */}
        <Route element={<LoginGuard />}>


          <Route element={<Navbar />}>
            {/* Employee Routes */}
            <Route path="/employee/*" element={<RoleGuard role="employee" />}>
              <Route path="profile" element={<Personal />} />
              <Route path="housing" element={<Housing />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="visa-status" element={<VisaStatusEmployees />} />
            </Route>

            {/* HR Routes */}
            <Route path="/hr/*" element={<RoleGuard role="hr" />}>
              <Route path="home" element={<EmployeeProfiles />} />
              <Route path="employee-profiles/:employeeId" element={<EmployeeDetail />} />
              <Route path="housing-management" element={<HousingMgmt />}/>
              <Route path='house-details/:houseId' element={<HouseDetails />} />
              <Route path="hiring" element={<Hiring />} />
              <Route path="visa-status" element={<VisaStatusHR />} />
              <Route path="addhouse" element={<AddHouse />} />
              <Route path="application/:employeeId" element={<Application />} />
            </Route>
          </Route>
        
        </Route>
        <Route path="*" element={<NotFound />} />



      </Routes>
    </BrowserRouter>
  );
};

export default RoutesComponent;

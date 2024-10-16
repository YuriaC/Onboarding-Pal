import './App.css'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { Onboarding, Housing, Login, Registration, HousingMgmt } from './pages'

function AppRoutes() {
  return useRoutes([
    { path: '/', element: <Onboarding /> },
    { path: '/housingmgmt', element: <HousingMgmt /> },
    { path: '/housing', element: <Housing /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Registration /> },
  ])
}

function App() {

  return (
    <>
      <Router>
        <AppRoutes />
      </Router>
    </>
  )
}

export default App

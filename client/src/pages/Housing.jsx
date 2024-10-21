import { useState, useEffect } from 'react'
import axios from 'axios'
import { USER_ENDPOINT } from '../constants'
import { toast, ToastContainer } from 'material-react-toastify'
import 'material-react-toastify/dist/ReactToastify.css'
import Cookies from 'js-cookie'

const Housing = () => {

    const [houseData, setHouseData] = useState({
        address: '',
        employees: [],
        landlordEmail: '',
        landlordName: '',
        landlordPhone: '',
        numBeds: 0,
        numChairs: 0,
        numMattresses: 0,
        numTables: 0,
        reports: [],
    })
    const [isCreatingReport, setIsCreatingReport] = useState(false)
    const [reportFormData, setReportFormData] = useState({
        title: '',
        description: '',
    })

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
            .then(response => {
                const token = Cookies.get('auth_token')
                const { _id, house } = response.data
                const {
                    address,
                    employees,
                    landlordEmail,
                    landlordName,
                    landlordPhone,
                    numBeds,
                    numChairs,
                    numMattresses,
                    numTables,
                    reports,
                } = house
                const otherEmployees = employees.filter(employee => {
                    console.log('employee:', employee)
                    return (
                        employee._id !== _id
                    )
                })
                console.log('otherEmployees:', otherEmployees)
                setHouseData({
                    address,
                    employees: employees.filter(employee => employee._id !== _id),
                    landlordEmail,
                    landlordName,
                    landlordPhone,
                    numBeds,
                    numChairs,
                    numMattresses,
                    numTables,
                    reports,
                })
            })
    }, [])

    const submitReport = (e) => {
        e.preventDefault()
        console.log('reportFormData:', reportFormData)
        // axios.post(HOUSE_ENDPOINT, reportFormData, {
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem('token')}`
        //     }
        // })
        // .then(response => {

        // })
        // .catch(error => {
        //     toast.error(error)
        // })
    }

    const handleChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target
        setReportFormData({
            ...reportFormData,
            [name]: value,
        })
    }

    return (
        <div>
            <h1>{houseData ? houseData.address : 'No address found'}</h1>
            <form>
                <fieldset>
                    <legend>Roommates</legend>
                    {houseData && houseData.employees.length > 0 ? 'Roommates incoming' : 'No roommates'}
                </fieldset>
            </form>
            <button onClick={() => setIsCreatingReport(!isCreatingReport)}>Create Facility Report</button>
            {isCreatingReport &&
                <>
                    <form onSubmit={submitReport}>
                        <label>Title: </label>
                        <input type='text' name='title' value={reportFormData.title} onChange={handleChange} required />
                        <br />
                        <label>Description: </label>
                        <textarea name='description' value={reportFormData.description} onChange={handleChange} required></textarea>
                        <input type='submit' value='Submit' />
                    </form>
                </>
            }
            <br />
            <button>View Your Reports</button>
        </div>
    )
}

export default Housing
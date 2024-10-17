import { useState, useEffect } from 'react'
import axios from 'axios'
import { HOUSE_ENDPOINT } from '../constants'
import { toast } from 'react-toastify'

const Housing = () => {

    const [houseData, setHouseData] = useState()
    const [isCreatingReport, setIsCreatingReport] = useState(false)
    const [reportFormData, setReportFormData] = useState({
        title: '',
        description: '',
    })

    useEffect(() => {
        // axios.get(HOUSE_ENDPOINT)
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
            <h1>{houseData ? houseData.name : 'Generic Housing Name'}</h1>
            <h2>{houseData ? houseData.address : 'No address found'}</h2>
            <form>
                <fieldset>
                    <legend>Roommates</legend>
                    {houseData && houseData.employees ? 'Roommates incoming' : 'No roommates'}
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
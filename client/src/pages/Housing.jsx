import { useState, useEffect } from 'react'
import axios from 'axios'
import { REPORT_ENDPOINT, USER_ENDPOINT } from '../constants'
import { toast, ToastContainer } from 'material-react-toastify'
import 'material-react-toastify/dist/ReactToastify.css'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Button, TextField, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'

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
        houseId: '',
    })
    // const [employeeId, setEmployeeId] = useState('')
    const [isCreatingReport, setIsCreatingReport] = useState(false)
    const [isViewingReports, setIsViewingReports] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [reportFormData, setReportFormData] = useState({
        title: '',
        description: '',
    })

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
            .then(response => {
                const { house } = response.data
                console.log('response.data:', response.data)
                // setEmployeeId(response.data._id)
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
                const houseId = house._id
                console.log('house:', house)
                const otherEmployees = employees.filter(employee => {
                    return (
                        employee._id !== response.data._id
                    )
                })
                console.log('otherEmployees:', otherEmployees)
                setHouseData({
                    address,
                    employees: otherEmployees,
                    landlordEmail,
                    landlordName,
                    landlordPhone,
                    numBeds,
                    numChairs,
                    numMattresses,
                    numTables,
                    reports: reports.filter((report) => {
                        return (
                            report.createdBy === response.data.username
                        )
                    }),
                    houseId,
                })
                console.log('reports:', reports)
            })
            .catch(error => {
                toast.error(`Error getting user info! Error: ${error.message}`)
            })
    }, [])

    const submitReport = (e) => {
        e.preventDefault()
        console.log('reportFormData:', reportFormData)
        axios.post(REPORT_ENDPOINT, { ...reportFormData, houseId: houseData.houseId }, {
            // headers: {
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            // },
            withCredentials: true,
        })
        .then(() => {
            setSubmitted(!submitted)
            toast.success('Successfully submitted report!')
        })
        .catch(error => {
            console.log('error:', error)
            toast.error(`Error submitting report! Error: ${error.response.data}`)
        })
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
            <Box sx={{ margin: 'auto', mt: 5 }}>
                <Card>
                    <CardContent>
                        <Typography variant='h3' gutterBottom>
                            {houseData ? houseData.address : 'No address found'}
                        </Typography>
                        <Typography variant='h5'>
                            Roommates:
                        </Typography>
                        {houseData && houseData.employees.length > 0
                            ? (
                                <List>
                                    {houseData.employees.map((roommate, index) => {

                                        return (
                                            <ListItem key={index}>
                                                <ListItemText primary={roommate.firstName} />
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            )
                            : (
                                <Typography variant='body1' color='text.secondary'>
                                    No roommates at this time
                                </Typography>
                            )}
                    </CardContent>
                </Card>
            </Box>
            <Box sx={{ margin: 'auto', mt: 2 }}>
                <Button onClick={() => setIsCreatingReport(!isCreatingReport)}>
                    Create Facility Report
                </Button>
                {isCreatingReport &&
                    <>
                        <form onSubmit={submitReport}>
                            {/* <label>Title: </label>
                            <input type='text' name='title' value={reportFormData.title} onChange={handleChange} required />
                            <br /> */}
                            <TextField
                                label='Title'
                                name='title'
                                variant='outlined'
                                fullWidth
                                margin='normal'
                                value={reportFormData.title}
                                onChange={handleChange}
                            />
                            <TextField
                                label='Description'
                                name='description'
                                variant='outlined'
                                fullWidth
                                rows={3}
                                margin='normal'
                                value={reportFormData.description}
                                onChange={handleChange}
                            />
                            <Button type='submit' variant='contained' color='primary'>
                                Submit
                            </Button>
                            {/* <label>Description: </label>
                            <textarea name='description' value={reportFormData.description} onChange={handleChange} required></textarea> */}
                            {/* <input type='submit' value='Submit' /> */}
                        </form>
                    </>
                }
                {/* <br /> */}
                {/* <button>View Your Reports</button> */}
            </Box>
            <Box sx={{ margin: 'auto', mt: 2 }}>
                <Card>
                    {houseData.reports.length === 0
                        ? <Typography>You haven&apos;t made any reports for this house</Typography>
                        : (
                            <>
                                <Button onClick={() => setIsViewingReports(!isViewingReports)}>
                                    View Your Reports
                                </Button>
                                {isViewingReports &&
                                    <List>
                                        {houseData.reports.map((report, index) => {

                                            return (
                                                <Accordion key={index}>
                                                    <AccordionSummary>
                                                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                            <Box>
                                                                <Typography>{report.title}</Typography>
                                                                <Typography>{report.description}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography>{report.createdBy}</Typography>
                                                                <Typography>{report.timestamp}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography>Status: {report.status}</Typography>
                                                            </Box>
                                                        </Box> */}
                                                        <Box sx={{ width: '100%' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <Typography sx={{ fontWeight: 'bold' }}>{report.title}</Typography>
                                                                    <Typography color='text.secondary'>{report.createdBy}</Typography>
                                                                    <Typography color='text.secondary'>{report.timestamp}</Typography>
                                                                    <Typography>Status: {report.status}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant='body2'>{report.description}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <List>
                                                            {report.comments.map((comment, commentIndex) => {

                                                                return (
                                                                    <ListItem key={commentIndex}>
                                                                        <ListItemText primary={comment.description} />
                                                                        <ListItemText secondary={comment.createdBy} />
                                                                        <ListItemText secondary={comment.timestamp} />
                                                                    </ListItem>
                                                                )
                                                            })}
                                                        </List>
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        })}
                                    </List>
                                }
                            </>
                        )
                    }
                </Card>
            </Box>
            <ToastContainer />
        </div>
    )
}

export default Housing
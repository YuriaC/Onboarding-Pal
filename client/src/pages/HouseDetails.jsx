import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { COMMENT_ENDPOINT, HOUSE_ENDPOINT, REPORT_ENDPOINT, USER_ENDPOINT } from '../constants'
import { toast, ToastContainer } from 'material-react-toastify'
import 'material-react-toastify/dist/ReactToastify.css'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Button, TextField, Accordion, AccordionDetails, AccordionSummary, ListItemIcon, Pagination } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'


const HouseDetails = () => {

    const { houseId } = useParams()
    const navigate = useNavigate()

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
    const [userInfo, setUserInfo] = useState({
        id: '',
        username: '',
        role: '',
    })
    const [isCreatingReport, setIsCreatingReport] = useState(false)
    const [commentChanges, setCommentChanges] = useState({})
    const [newReportComments, setNewReportComments] = useState({})
    const [isViewingReports, setIsViewingReports] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [reportFormData, setReportFormData] = useState({
        title: '',
        description: '',
    })
    const [reportsPage, setReportsPage] = useState(1)
    const reportsPerPage = 5
    const currReports = houseData.reports.slice((reportsPage - 1) * reportsPerPage, reportsPage * reportsPerPage)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
                const userData = userResponse.data
                console.log('userData:', userData)
                setUserInfo({
                    id: userData._id,
                    username: userData.username,
                    role: userData.role,
                })
                const houseResponse = await axios.get(`${HOUSE_ENDPOINT}/details/${houseId}`, { withCredentials: true })
                const houseResData = houseResponse.data
                console.log('houseResData:', houseResData)
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
                } = houseResData
                setHouseData({
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
                    houseId,
                })
                let newComments = {}
                let newCommentReports = {}
                for (const report of reports) {
                    newCommentReports[report._id] = ''
                    const comments = report.comments
                    for (const comment of comments) {
                        newComments[comment._id] = comment.description
                    }
                }
                setNewReportComments(newCommentReports)
                setCommentChanges(newComments)
            }
            catch (error) {
                toast.error(`Error fetching data! Error: ${error.message}`)
            }
        }
        // axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
        //     .then(response => {
        //         // const { house } = response.data
        //         // const otherEmployees = employees.filter(employee => {
        //         //     return (
        //         //         employee._id !== response.data._id
        //         //     )
        //         // })
        //         // let newComments = {}
        //         // let newCommentReports = {}
        //         // for (const report of reports) {
        //         //     newCommentReports[report._id] = ''
        //         //     const comments = report.comments
        //         //     for (const comment of comments) {
        //         //         newComments[comment._id] = comment.description
        //         //     }
        //         // }
        //         // setNewReportComments(newCommentReports)
        //         // setCommentChanges(newComments)
        //         // console.log('reports:', reports)
        //     })
        //     .catch(error => {
        //         toast.error(`Error getting user info! Error: ${error.message}`)
        //     })
        fetchData()
    }, [submitted])

    const submitReport = (e) => {
        e.preventDefault()
        console.log('reportFormData:', reportFormData)
        axios.post(REPORT_ENDPOINT, { ...reportFormData, houseId: houseData.houseId }, {
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

    const handleAddCommentChange = (e, reportId) => {
        const { value } = e.target
        console.log('reportId:', reportId)
        console.log('value:', value)
        setNewReportComments({
            ...newReportComments,
            [reportId]: value,
        })
    }

    const addNewComment = async (e, reportId) => {
        e.preventDefault()
        console.log('newReportComments[reportId]:', newReportComments[reportId])
        console.log('reportId:', reportId)
        const description = newReportComments[reportId]
        await axios.post(`${COMMENT_ENDPOINT}`, { reportId, description }, {
            withCredentials: true,
        })
            .then(() => {
                setSubmitted(prev => !prev)
                toast.success('Successfully added new comment!')
            })
            .catch(error => {
                console.log('error:', error)
                toast.error(`Error adding new comment! Error: ${error.message}`)
            })
    }

    const handleCommentChange = (e, commentId) => {
        const { value } = e.target
        setCommentChanges({
            ...commentChanges,
            [commentId]: value,
        })
    }

    const editComment = async (e, commentId) => {
        e.preventDefault()
        const description = commentChanges[commentId]
        console.log('New comment:', commentChanges[commentId])
        await axios.put(`${COMMENT_ENDPOINT}`, { commentId, description }, {
            withCredentials: true,
        })
            .then(() => {
                setSubmitted(prev => !prev)
                toast.success('Successfully edited comment!')
            })
            .catch(error => {
                console.log('error:', error)
                toast.error(`Error editing comment! Error: ${error.message}`)
            })
    }

    const viewEmployee = (e, employeeId) => {
        e.preventDefault()
        navigate(`/hr/employee-profiles/${employeeId}`)
    }

    return (
        <div style={{ width: '80vw' }}>
            <Box sx={{ margin: 'auto', mt: 5 }}>
                <Card>
                    <CardContent>
                        <Typography variant='h4' sx={{ mb: '2rem' }}>
                            {houseData ? houseData.address : 'No address found'}
                        </Typography>
                        <Typography variant='h5' sx={{ mb: 1 }}>
                            Facility Info:
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'start', mb: '2rem', gap: 4 }}>
                            <Typography variant='body1' color='textPrimary'>
                                Beds: {houseData.numBeds}
                            </Typography>
                            <Typography variant='body1' color='textPrimary'>
                                Mattresses: {houseData.numMattresses}
                            </Typography>
                            <Typography variant='body1' color='textPrimary'>
                                Tables: {houseData.numTables}
                            </Typography>
                            <Typography variant='body1' color='textPrimary'>
                                Chairs: {houseData.numChairs}
                            </Typography>
                        </Box>
                        <Typography variant='h5' sx={{ mb: 1 }}>
                            Landlord:
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'start', mb: '2rem', gap: 4 }}>
                            <Typography variant='body1' color='textPrimary'>
                                {houseData.landlordName}
                            </Typography>
                            <Typography variant='body1' color='textPrimary'>
                                <PhoneIcon />
                                {houseData.landlordPhone}
                            </Typography>
                            <Typography variant='body1' color='textPrimary'>
                                <EmailIcon />
                                {houseData.landlordEmail}
                            </Typography>
                        </Box>
                        <Typography variant='h5'>
                            {userInfo.role === 'employee' ? 'Roommates:' : 'Employees:'}
                        </Typography>
                        {houseData && houseData.employees.length > 0
                            ? (
                                <List>
                                    {houseData.employees.map((roommate, index) => {
                                        console.log('roommate:', roommate)
                                        return (
                                            <ListItem key={index} sx={{ display: 'flex', justifyContent: 'start', gap: 4 }}>
                                                {/* <ListItemText sx={{ cursor: 'pointer', width: '3rem' }} onClick={(e) => viewEmployee(e, roommate._id)} primary={`${roommate.firstName}${roommate.preferredName ? ` "${roommate.preferredName}"` : ''}${roommate.middleName ? ` ${roommate.middleName}`: ''} ${roommate.lastName}`} /> */}
                                                <Typography sx={{ cursor: 'pointer' }} onClick={(e) => viewEmployee(e, roommate._id)}>{`${roommate.firstName}${roommate.preferredName ? ` "${roommate.preferredName}"` : ''}${roommate.middleName ? ` ${roommate.middleName}`: ''} ${roommate.lastName}`}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {/* <ListItemIcon><PhoneIcon /></ListItemIcon> */}
                                                    <PhoneIcon />
                                                    {/* <Typography>{roommate.cellPhone}</Typography> */}
                                                    <ListItemText secondary={roommate.cellPhone || 'No phone provided'} />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {/* <ListItemIcon><EmailIcon /></ListItemIcon> */}
                                                    <EmailIcon />
                                                    {/* <Typography>{roommate.email}</Typography> */}
                                                    <ListItemText secondary={roommate.email} />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {!roommate.carColor && !roommate.carMake && !roommate.carModel
                                                        ? <Typography>No car info</Typography>
                                                        :
                                                        <>
                                                            <ListItemIcon>
                                                                <DirectionsCarIcon />
                                                            </ListItemIcon>
                                                            <ListItemText secondary={`${[roommate.carColor, roommate.carMake, roommate.carModel].filter(Boolean).join(' ')}`} />
                                                        </>
                                                    }
                                                </Box>
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            )
                            : (
                                <Typography variant='body1' color='text.secondary'>
                                    No employees assigned to this house at this time
                                </Typography>
                            )
                        }
                    </CardContent>
                </Card>
            </Box>
            {userInfo.role === 'employee' && <Box sx={{ margin: 'auto', mt: 2 }}>
                <Button onClick={() => setIsCreatingReport(!isCreatingReport)}>
                    Create Facility Report
                </Button>
                {isCreatingReport &&
                    <>
                        <form onSubmit={submitReport}>
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
                                sx={{ mb: 2 }}
                            />
                            <Button type='submit' variant='contained' color='primary'>
                                Submit
                            </Button>
                        </form>
                    </>
                }
            </Box>}
            <Box sx={{ margin: 'auto', mt: 2 }}>
                <Card>
                    {houseData.reports.length === 0
                        ? <Typography>No reports have been made about this house at this time</Typography>
                        : (
                            <>
                                <Button onClick={() => setIsViewingReports(!isViewingReports)}>
                                    View{userInfo.role === 'employee' ? ' Your ' : ' '}Reports
                                </Button>
                                {isViewingReports &&
                                <>
                                    <List>
                                        {currReports.map((report, index) => {

                                            return (
                                                <Accordion key={index} sx={{ minWidth: '60vw' }}>
                                                    <AccordionSummary>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <Typography sx={{ fontWeight: 'bold' }}>{report.title}</Typography>
                                                                <Typography color='text.secondary'>Creator: {report.createdBy}</Typography>
                                                                <Typography color='text.secondary'>{report.timestamp}</Typography>
                                                                <Typography>Status: {report.status}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant='body2'>Description: {report.description}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <List>
                                                            {report.comments.map((comment) => {

                                                                return (
                                                                    <ListItem
                                                                        key={comment._id}
                                                                        // sx={{ display: 'flex', justifyContent: 'space-between' }} // Doesn't do anything
                                                                    >
                                                                        <form onSubmit={(e) => editComment(e, comment._id)} style={{ display: 'flex', width: '65%' }}>
                                                                            <TextField
                                                                                value={commentChanges[comment._id]}
                                                                                onChange={(e) => handleCommentChange(e, comment._id)}
                                                                                sx={{ width: '100%', mr: '1rem', color: 'black' }}
                                                                                variant='outlined'
                                                                                slotProps={{
                                                                                    input: {
                                                                                        readOnly: comment.createdBy !== userInfo.username,
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {comment.createdBy === userInfo.username &&
                                                                                <Button type='submit' sx={{ mr: '1rem' }}>
                                                                                    Edit Comment
                                                                                </Button>
                                                                            }
                                                                        </form>
                                                                        <ListItemText secondary={comment.createdBy} />
                                                                        <ListItemText secondary={`${comment.timestamp}${comment.isEdited ? ' *' : ''}`} />
                                                                    </ListItem>
                                                                )
                                                            })}
                                                            <ListItem>
                                                                <form onSubmit={(e) => addNewComment(e, report._id)} style={{ display: 'flex', width: '100%' }}>
                                                                    <TextField
                                                                        value={newReportComments[report._id]}
                                                                        onChange={(e) => handleAddCommentChange(e, report._id)}
                                                                        sx={{ width: '80%' }}
                                                                        variant='outlined'
                                                                        placeholder='Add new comment'
                                                                        required
                                                                    />
                                                                    <Button type='submit' sx={{ ml: '1rem' }}>
                                                                        Add Comment
                                                                    </Button>
                                                                </form>
                                                            </ListItem>
                                                        </List>
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        })}
                                    </List>
                                    <Pagination
                                        count={Math.ceil(houseData.reports.length / reportsPerPage)}
                                        page={reportsPage}
                                        onChange={(_, value) => setReportsPage(value)}
                                        sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}
                                    />
                                </>
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

export default HouseDetails
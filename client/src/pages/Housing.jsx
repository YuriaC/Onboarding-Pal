import { useState, useEffect } from 'react'
import axios from 'axios'
import { COMMENT_ENDPOINT, REPORT_ENDPOINT, USER_ENDPOINT } from '../constants'
import { toast, ToastContainer } from 'material-react-toastify'
import 'material-react-toastify/dist/ReactToastify.css'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Box, Button, TextField, Accordion, AccordionDetails, AccordionSummary, ListItemIcon } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'

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
    const [userInfo, setUserInfo] = useState({
        id: '',
        username: '',
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

    useEffect(() => {
        axios.get(`${USER_ENDPOINT}/userinfo`, { withCredentials: true })
            .then(response => {
                const { house } = response.data
                console.log('response.data:', response.data)
                setUserInfo({
                    id: response.data._id,
                    username: response.data.username,
                })
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
                console.log('reports:', reports)
            })
            .catch(error => {
                toast.error(`Error getting user info! Error: ${error.message}`)
            })
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

    return (
        <div style={{ width: '90vw' }}>
            <Box sx={{ margin: 'auto', mt: 5 }}>
                <Card>
                    <CardContent>
                        <Typography variant='h4' sx={{ mb: '2rem' }}>
                            {houseData ? houseData.address : 'No address found'}
                        </Typography>
                        <Typography variant='h5'>
                            Roommates:
                        </Typography>
                        {houseData && houseData.employees.length > 0
                            ? (
                                <List>
                                    {houseData.employees.map((roommate, index) => {
                                        console.log('roommate:', roommate)
                                        return (
                                            <ListItem key={index}>
                                                <ListItemText primary={`${roommate.firstName}${roommate.preferredName ? ` "${roommate.preferredName}"` : ''}${roommate.middleName ? ` ${roommate.middleName}`: ''} ${roommate.lastName}`} />
                                                <ListItemIcon><PhoneIcon /></ListItemIcon>
                                                <Typography>{roommate.cellPhone}</Typography>
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
                                                <Accordion key={index} sx={{ minWidth: '60vw' }}>
                                                    <AccordionSummary>
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
                                                            {report.comments.map((comment) => {

                                                                return (
                                                                    <ListItem key={comment._id}>
                                                                        <form onSubmit={(e) => editComment(e, comment._id)} style={{ display: 'flex', width: '70%' }}>
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
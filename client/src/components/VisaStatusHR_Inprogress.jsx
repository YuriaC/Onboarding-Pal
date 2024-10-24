import {useState, useEffect} from 'react';
// import MyDocument from '../helpers/PdfViewer';
import axios from 'axios';
import { pdfjs } from "react-pdf";
import { Box, Button, TextField, Typography } from '@mui/material'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { USER_ENDPOINT } from '../constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


pdfjs.GlobalWorkerOptions.workerSrc = `http://localhost:3000/workers/pdf.worker.min.mjs`;

const docStatuses = ['optStatus', 'eadStatus', 'i983Status', 'i20Status']
const docUrls = ['optUrl', 'eadUrl', 'i983Url', 'i20Url']
const docNames = ['OPT', 'OPT EAD', 'I-983', 'I-20']

const VisaStatusHR_inprogress = () => {
    
    const today = new Date();
    const navigate = useNavigate()
    // const [fileDisplayId, setFileDisplayId] = useState();
    // const [showFileBtn, setShowFileBtn] = useState(true);
    // const [currentFileUrl, setCurrentFileUrl] = useState();
    const [feedbacks, setFeedbacks] = useState([])
    const [changed, setChanged] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // for users that holds f1-opt option
    // OPT Receipt should be submitted during onboarding stage
    // OPT EAD, I-983, I-20 should be submitted subsequently.

    const [employees, setEmployees] = useState([]); // Static employee data
    // Fetch all users from the backend API
    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users/alluser');
            const initFeedbacks = []
            const newData = []
            for (const employee of response.data) {
                let needSubmitNext = true
                let docToReview = ''
                let currDoc = ''
                let currDocName = ''
                // let nextDoc = ''
                let nextDocName = ''
                initFeedbacks.push('')
                for (const docStatus of docStatuses) {
                    if (employee[docStatus] === 'Pending') {
                        needSubmitNext = false
                        break
                    }
                }
                for (let i = 0; i < docStatuses.length; i++) {
                    const currDocStatus = docStatuses[i]
                    if (employee[currDocStatus] === 'Pending') {
                        needSubmitNext = false
                    }
                    if (employee['optStatus'] === 'Not Started') {
                        currDoc = currDocStatus
                        currDocName = docNames[0]
                        nextDocName = docNames[1]
                        docToReview = docUrls[0]
                        break
                    }
                    if (i > 0 && employee[currDocStatus] === 'Not Started') {
                        docToReview = docUrls[i - 1]
                        currDoc = docStatuses[i - 1]
                        currDocName = docNames[i - 1]
                        nextDocName = docNames[i]
                        break
                    }
                    if (i === docStatuses.length - 1) {
                        docToReview = docUrls[i]
                        currDoc = docStatuses[i]
                        currDocName = docNames[i]
                    }
                    // if (['Pending', 'Rejected'].includes(employee[currDocStatus])) {
                    // }
                    // if (employee[currDocStatus] === 'Not Started' && !nextDocName) {
                    //     // nextDoc = currDocStatus
                    //     nextDocName = docNames[i]
                    // }
                }
                const userDocs = await axios.get(`${USER_ENDPOINT}/getuserdocs/${employee._id}`, { withCredentials: true })
                const newEmployeeData = {
                    ...employee,
                    needSubmitNext,
                    isRejecting: false,
                    docs: userDocs.data,
                    docToReview,
                    currDoc,
                    // nextDoc,
                    nextDocName,
                    currDocName,
                }
                newData.push(newEmployeeData)
            }
            console.log('newData:', newData)
            setFeedbacks(initFeedbacks)
            setEmployees(newData); // Store fetched users in state
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
        };

        fetchUsers();
    }, [submitted]);

    const formatDateToMDY = (date) => {
        if(date){
            const dateobj = new Date(date);
            const month = String(dateobj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(dateobj.getDate()).padStart(2, '0'); // Ensure 2-digit day
            const year = dateobj.getFullYear();
            return `${month}/${day}/${year}`;
        }
        return "not applicable"
        
    }

    const calculateDaysDifference = (endDate, currentDate) => {
        // Convert both dates to milliseconds
        if(endDate && currentDate){
            const dateobj = new Date(endDate);
            const timeDiff = dateobj - currentDate; // Absolute difference to avoid negative values
            // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 ms)
            const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            return dayDiff;
        }
        return "not applicable"
    }

    const allFileApproved = (user_to_check) =>{
        return user_to_check.optStatus === "Approved" && user_to_check.eadStatus === "Approved" && user_to_check.i983Status === "Approved" && user_to_check.i20Status === "Approved";
    }

    const notificationHandler = async (user) =>{
        //send an email notification to the user
        // const step_status = stepStatusChecker(user);
        let message_to_employee = "";
        // if(step_status!=="i20"){
        //     message_to_employee = `Hello ${user.firstName} ${user.lastName}, your submission of ${step_status} has been Approved, please submit the next document.`;
        // }else{
        //     message_to_employee = `Hello ${user.firstName} ${user.lastName}, all of your submitted visa documents has been reviewed and Approved.`;
        // }
        console.log('currDoc:', user.currDoc)
        if (user.isPermRes === 'No' && user.workAuth === 'F1(CPT/OPT)') {
            if (user[user.currDoc] === 'Rejected') {
                message_to_employee = `Hello ${user.firstName} ${user.lastName}, your ${user.currDocName} has been rejected. Please submit it again.`
            }
            else {
                message_to_employee = `Hello ${user.firstName} ${user.lastName}, your ${user.currDocName} has been approved! Please ${user.currDoc === 'eadStatus' ? 'download and ' : ''}submit your ${user.nextDocName} next.`
            }
        }
        else {
            if (user.onboardingStatus === 'Rejected') {
                message_to_employee = `Hello ${user.firstName} ${user.lastName}, your onboarding application has been rejected. Please submit it again.`
            }
            else {
                message_to_employee = `Hello ${user.firstName} ${user.lastName}, you haven't submitted your onboarding application yet. Please submit it soon!`
            }
        }
        
        try {
            const response = await axios.post(`http://localhost:3000/api/users/emailNotify`, {
              id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              useremail: user.email,
              notification: message_to_employee,
            });
            console.log('Email Notification sent:', response.data);
            toast.success('Email Notification sent successfully!')
            // alert('Email Notification sent successfully!');
          } catch (error) {
            console.error('Error Email Notification sent:', error);
            toast.error('Failed to sent Email Notification!')
            // alert('Failed to sent Email Notification!');
          }
    }

    const updateReject = (e, index) => {
        e.preventDefault()
        const newEmployees = employees
        newEmployees[index].isRejecting = !newEmployees[index].isRejecting
        console.log('newEmployees:', newEmployees)
        setChanged(!changed)
        setEmployees(newEmployees)
    }

    const updateFeedback = (e, index) => {
        e.preventDefault()
        const newFeedbacks = feedbacks
        feedbacks[index] = e.target.value
        setChanged(!changed)
        setFeedbacks(newFeedbacks)
    }

    const handleApprove = async (e, index) => {
        e.preventDefault()
        const employeeId = employees[index]._id
        const data = {
            newStatus: 'Approved',
            doc: employees[index].currDoc,
        }
        axios.put(`${USER_ENDPOINT}/updateworkauthstatus/${employeeId}`, data, { withCredentials: true })
        .then(response => {
            console.log('response:', response)
            // const newEmployees = employees
            // newEmployees[index].isRejecting = false
            // setEmployees(newEmployees)
            // const newFeedbacks = feedbacks
            // newFeedbacks[index] = ''
            // setFeedbacks(newFeedbacks)
            setSubmitted(!submitted)
        })
        .catch(error => {
            toast.error(`Error rejecting visa status! Error: ${error.message}`)
        })
    }

    const handleReject = async (e, index) => {
        e.preventDefault()
        const feedback = feedbacks[index]
        const employeeId = employees[index]._id
        const data = {
            newStatus: 'Rejected',
            doc: employees[index].currDoc,
            feedback,
        }
        axios.put(`${USER_ENDPOINT}/updateworkauthstatus/${employeeId}`, data, { withCredentials: true })
            .then(response => {
                console.log('response:', response)
                const newEmployees = employees
                newEmployees[index].isRejecting = false
                setEmployees(newEmployees)
                const newFeedbacks = feedbacks
                newFeedbacks[index] = ''
                setFeedbacks(newFeedbacks)
                setSubmitted(!submitted)
            })
            .catch(error => {
                toast.error(`Error rejecting visa status! Error: ${error.message}`)
            })
    }
    
    return (
        <>
            <Box sx={{ 
                width: '120%', 
                height: '400px', 
                margin: 'auto', 
                padding: '20px', 
            }}>
            <TableContainer component={Paper}>
            <Table sx={{
                    maxWidth: 'none', // Disable height constraints
                    overflow: 'visible', // Ensure no scrollbars
                    }}  aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan="3">Legal Name</TableCell>
                        <TableCell colSpan="4" >Work Authorization</TableCell>
                        <TableCell rowSpan="2">Next Steps</TableCell>
                        <TableCell rowSpan="2">Action</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>First Name</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Middle Name</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Last Name</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Start Date</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>End Date</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Days Remaining</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {employees.map((user, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.firstName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.middleName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.lastName}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.isPermRes === 'Yes' ? user.permResStatus : user.workAuth}</TableCell>
                        <TableCell>{formatDateToMDY(user.visaStartDate)}</TableCell>
                        <TableCell>{formatDateToMDY(user.visaEndDate)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{calculateDaysDifference(user.visaEndDate,today) < 0 ? 'Expired' : calculateDaysDifference(user.visaEndDate,today)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {console.log('user:', user)}
                            {user.isPermRes === 'No' && user.workAuth === 'F1(CPT/OPT)' ?
                            <>
                                { allFileApproved(user) ? <Typography>All done!</Typography> : !user.needSubmitNext ? (<Button variant='contained' href={user.docs[user.docToReview].preview} target='_blank'>Review Document</Button>) : (<Typography>{user[user.currDoc] !== 'Rejected' ? `${user.nextDocName} waiting to be submitted` : `${user.currDocName} waiting to be resubmitted`}</Typography>) }
                            </>
                            :
                            <>
                                { user.onboardingStatus === 'Approved' ? <Typography>All done!</Typography> : user.onboardingStatus === 'Pending' ? (<Button variant='contained' onClick={() => navigate(`/hr/application/${user._id}`)}>Review Application</Button>) : (<Typography>{user.onboardingStatus !== 'Rejected' ? `Application waiting to be submitted` : `Application waiting to be resubmitted`}</Typography>) }
                            </>
                        }
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.isPermRes === 'No' && user.workAuth === 'F1(CPT/OPT)' ?
                            (<div>
                                {!allFileApproved(user) ? <div>
                                    { user.needSubmitNext ? (<Button onClick={ () => notificationHandler(user) }>Send Notification</Button>) :
                                        <>
                                            <Button onClick={(e) => handleApprove(e, index)} sx={{ backgroundColor: 'green', color: 'white' }} fullWidth>Approve</Button>
                                            <Button onClick={(e) => updateReject(e, index)} sx={{ backgroundColor: 'red', color: 'white' }} fullWidth>Reject</Button>
                                            {user.isRejecting &&
                                                <form onSubmit={(e) => handleReject(e, index)}>
                                                    <TextField label='Feedback' value={feedbacks[index]} onChange={(e) => updateFeedback(e, index)} fullWidth></TextField>
                                                    <Button type='submit'>Submit Feedback</Button>
                                                </form>
                                            }
                                        </>
                                    }
                                </div> : (
                                    <Typography>No further action required</Typography>
                                )}
                            </div>) : (
                                <>
                                    {user.onboardingStatus === 'Approved' ? <>
                                        <Typography>No further action required</Typography>
                                    </> : user.onboardingStatus === 'Rejected' ? (
                                        <Button onClick={ () => notificationHandler(user) }>Send Notification</Button>
                                    ) : user.onboardingStatus === 'Pending' ? (
                                        <Typography>Approve or reject</Typography>
                                    ) : (
                                        <Button onClick={ () => notificationHandler(user) }>Send Notification</Button>
                                    )}
                                </>
                            )
                            }
                            {/* {allFileApproved(user) &&
                            (<div>
                                <Typography>No further action required</Typography>
                            </div>)
                            } */}
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
            </Box>
            
        </>
        
    )
}

export default VisaStatusHR_inprogress;
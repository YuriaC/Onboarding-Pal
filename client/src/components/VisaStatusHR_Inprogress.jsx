import {useState, useEffect} from 'react';
import MyDocument from '../helpers/PdfViewer';
import axios from 'axios';
import { pdfjs } from "react-pdf";
import { Button, TextField, Typography } from '@mui/material'
import { USER_ENDPOINT } from '../constants';
import { toast } from 'react-toastify';

pdfjs.GlobalWorkerOptions.workerSrc = `http://localhost:3000/workers/pdf.worker.min.mjs`;

const docStatuses = ['optStatus', 'eadStatus', 'i983Status', 'i20Status']
const docUrls = ['optUrl', 'eadUrl', 'i983Url', 'i20Url']
const docNames = ['OPT', 'OPT EAD', 'I-983', 'I-20']

const VisaStatusHR_inprogress = () => {
    
    const today = new Date();
    // const [fileDisplayId, setFileDisplayId] = useState();
    const [showFileBtn, setShowFileBtn] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState();
    const [feedbacks, setFeedbacks] = useState([])
    const [changed, setChanged] = useState(false)

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
                    if (['Pending', 'Rejected'].includes(employee[currDocStatus])) {
                        needSubmitNext = false
                        docToReview = docUrls[i]
                        currDoc = currDocStatus
                    }
                    if (employee[currDocStatus] === 'Not Started' && !nextDocName) {
                        // nextDoc = currDocStatus
                        nextDocName = docNames[i]
                    }
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
    }, []);

    const formatDateToMDY = (date) => {
        const dateobj = new Date(date);
        const month = String(dateobj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(dateobj.getDate()).padStart(2, '0'); // Ensure 2-digit day
        const year = dateobj.getFullYear();
        return `${month}/${day}/${year}`;
    }

    const calculateDaysDifference = (endDate, currentDate) => {
        // Convert both dates to milliseconds
        const dateobj = new Date(endDate);
        const timeDiff = dateobj - currentDate; // Absolute difference to avoid negative values
        // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 ms)
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return dayDiff;
    }

    const allFileApproved = (user_to_check) =>{
        return user_to_check.optStatus === "Approved" && user_to_check.eadStatus === "Approved" && user_to_check.i983Status === "Approved" && user_to_check.i20Status === "Approved";
    }

    const stepStatusChecker = (user_tocheck) =>{
        const opt = user_tocheck.optStatus;
        const ead = user_tocheck.eadStatus;
        const i983 = user_tocheck.i983Status;
        const i20 = user_tocheck.i20Status;
        if(opt==="Pending" || opt === "Rejected" || opt === "Not Started"){
            return "opt";
        }
        if(opt==="Approved" && (ead === "Pending" || ead ==="Rejected" || ead  === "Not Started")){
            return "ead";
        }
        if(opt==="Approved" && ead === "Approved" &&(i983 === "Pending" || i983 ==="Rejected" || i983  === "Not Started")){
            return "i983";
        }
        if(opt==="Approved" && ead === "Approved" && i983 === "Approved" &&(i20 === "Pending" || i20 ==="Rejected" || i20  === "Not Started")){
            return "i20";
        }
        if(allFileApproved(user_tocheck)){
            return "alldone";
        }

    }

    // const haveFileToReview = (user_to_check) =>{
    //     if(stepStatusChecker(user_to_check)==="opt"){
    //         return user_to_check.optUrl !== "";
    //     }
    //     if(stepStatusChecker(user_to_check)==="ead"){
    //         return user_to_check.eadUrl !== "";
    //     }
    //     if(stepStatusChecker(user_to_check)==="i983"){
    //         return user_to_check.i983Url !== "";
    //     }
    //     if(stepStatusChecker(user_to_check)==="i20"){
    //         return user_to_check.i20Url !== "";
    //     }
    // }

    const nextstepsHandler = (user)=>{
        // checks user status if Pending then pop to set next steps
        const review_opt_receipt = "OPT receipt waiting for HR approval";
        const review_ead = "EAD waiting for HR approval";
        const review_i983 = "i983 waiting for HR approval";
        const review_i20 = "i20 waiting for HR approval";
        const submit_opt_receipt = "submit OPT receipt";
        const submit_ead = "submit EAD";
        const submit_i983 = "submit i983";
        const submit_i20 = "submit i20";
        const alldone = "all visa file submitted and reviewed";
        if(stepStatusChecker(user) === "opt"){
            if(user.optUrl){
                //show the file, 
                return review_opt_receipt;
            }
            return submit_opt_receipt;
        }
        if(stepStatusChecker(user) === "ead"){
            //render the review document 
            if(user.eadUrl){
                return review_ead;
            }

            return submit_ead;
            
        }
        if(stepStatusChecker(user) === "i983"){
            //render the review document 
            //setShowNotifyBtn(true);
            if(user.i983Url) {
                return review_i983;
            }
            //setNotifyID(user._id);
            return submit_i983;
        }
        if(stepStatusChecker(user) === "i20"){
            //render the review document 
            //setShowNotifyBtn(true);
            if(user.i20Url){
                return review_i20;
            }
           //setNotifyID(user._id);
            return submit_i20;
        }
        if(allFileApproved(user)){
            //render the review document 
            //setShowNotifyBtn(true);
            return alldone;
        }

    }

    const actionHandler = async(user, decision) =>{
        // action1: files submitted, need review to approve or reject (when reject send message to user management)
        // action2: submit the next document, send reminder to the user
        // approve/reject
        const step_status = stepStatusChecker(user);
            //user set corresponding status to approve // api call to update the database
            if(step_status === "opt"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, optStatus: decision } : user_itr
                    )
                )
                //modify the changed visa document status for user
                try {
                    const response = await axios.post(`http://localhost:3000/api/users/updateworkauthStatus`, {
                        id: user._id,
                        optStatus: decision
                    });
                    console.log('User updated:', response.data);
                    } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user.');
                    }
            };
            
            if(step_status === "ead"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, eadStatus: decision } : user_itr
                    )
                )
                try {
                    const response = await axios.post(`http://localhost:3000/api/users/updateworkauthStatus`, {
                        id: user._id,
                        eadStatus: decision
                    });
                    console.log('User updated:', response.data);
                    //alert('User updated successfully!');
                    } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user.');
                    }
            }
            if(step_status === "i983"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i983Status: decision } : user_itr
                    )
                )
                try {
                    const response = await axios.post(`http://localhost:3000/api/users/updateworkauthStatus`, {
                        id: user._id,
                        i983Status: decision
                    });
                    console.log('User updated:', response.data);
                    //alert('User updated successfully!');
                    } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user.');
                    }
            }
            if(step_status === "i20"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i20Status: decision } : user_itr
                    )
                )
                try {
                    const response = await axios.post(`http://localhost:3000/api/users/updateworkauthStatus`, {
                        id: user._id,
                        i20Status: decision
                    });
                    console.log('User updated:', response.data);
                    //alert('User updated successfully!');
                    } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user.');
                    }
            }
        if (decision === "rejected") {
            //if rejected, send this message to the employee side to remind resubmission.
            const reject_message=`Hello ${user.firstName} ${user.lastName}, your submitted file for ${step_status} has been rejected by HR, please resubmit.`;
            //console.log(`Hello ${user.firstName} ${user.lastName}, your submitted file for ${step_status} has been rejected by HR, please resubmit.`)
            //todo, modify the message to the user
            try {
                const response = await axios.post(`http://localhost:3000/api/users/postVisaDecision`, {
                  id: user._id,
                  message: reject_message
                });
                console.log('User visa document decision posted:', response.data);
                alert('Visa document decision posted successfully!');
              } catch (error) {
                console.error('Error posting user visa document decision:', error);
                alert('Failed to post Visa document decision.');
              }
        }

        

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
        if (user.docs[user.docToReview] === 'Rejected') {
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, your ${user.currDoc} has been rejected. Please submit it again.`
        }
        else {
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, your ${user.currDoc} has been approved!. Please submit your ${user.nextDocName} next.`
        }
        
        // console.log(message_to_employee);
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

    // const viewFileHandler = (user) =>{
    //     if(user._id !== fileDisplayId && showFileBtn){
    //         setFileDisplayId(user._id);
            
    //     }else{
    //         setFileDisplayId(null);
    //     }
    //     setShowFileBtn(!showFileBtn);
    //     if(stepStatusChecker(user)==="opt"){
    //         setCurrentFileUrl(user.optUrl);
    //     }
    //     if(stepStatusChecker(user)==="ead"){
    //         setCurrentFileUrl(user.eadUrl);
    //     }
    //     if(stepStatusChecker(user)==="i983"){
    //         setCurrentFileUrl(user.i983Url);
    //     }
    //     if(stepStatusChecker(user)==="i20"){
    //         setCurrentFileUrl(user.i20Url);
    //     }
    // }

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
                setChanged(!changed)
            })
            .catch(error => {
                toast.error(`Error rejecting visa status! Error: ${error.message}`)
            })
    }
    
    return (
        <>
            <table border="1">
                <thead>
                    <tr>
                        <th colSpan="3">Legal Name</th>
                        <th colSpan="4" >Work Authorization</th>
                        <th rowSpan="2">Next Steps</th>
                        <th rowSpan="2">Action</th>
                    </tr>
                    <tr>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Last Name</th>
                        <th>Title</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days Remaining</th>
                    </tr>
                </thead>
                <tbody>
                {employees.map((user, index) => (
                    <tr key={index}>
                        <td>{user.firstName}</td>
                        <td>{user.middleName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.workAuth}</td>
                        <td>{formatDateToMDY(user.visaStartDate)}</td>
                        <td>{formatDateToMDY(user.visaEndDate)}</td>
                        <td>{calculateDaysDifference(user.visaEndDate,today)}</td>
                        <td>
                            {/* {nextstepsHandler(user)} */}
                            {/* { console.log(user.docs[user.docToReview].preview) } */}
                            {/* { haveFileToReview(user) && (<Button onClick={()=>viewFileHandler(user)}>{fileDisplayId === user._id ? 'Hide' : 'Show'} Submitted File</Button>)} */}
                            { !user.needSubmitNext ? (<Button variant='contained' href={user.docs[user.docToReview].preview} target='_blank'>Review Document</Button>) : (<Typography>{user.nextDocName} waiting to be submitted</Typography>) }
                        </td>
                        <td>
                            {!allFileApproved(user) &&
                            (<div>
                                { user.needSubmitNext ? (<Button onClick={ () => notificationHandler(user) }>Send Notification</Button>) :
                                    <>
                                        <Button onClick={() => actionHandler(user, 'Approved')} sx={{ backgroundColor: 'green', color: 'white' }}>Approve</Button>
                                        <Button onClick={(e) => updateReject(e, index)} sx={{ backgroundColor: 'red', color: 'white' }}>Reject</Button>
                                        {user.isRejecting &&
                                            <form onSubmit={(e) => handleReject(e, index)}>
                                                <TextField label='Feedback' value={feedbacks[index]} onChange={(e) => updateFeedback(e, index)} fullWidth></TextField>
                                                <Button type='submit'>Submit Feedback</Button>
                                            </form>
                                        }
                                    </>
                                }
                            </div>)
                            }
                            {allFileApproved(user) &&
                            (<div>
                                no actions for this employee
                            </div>)
                            }
                        </td>
                    </tr>
                ))}
                </tbody>

            </table>
            {showFileBtn && (
                <div >
                    {<MyDocument pdfFile={currentFileUrl}/>}
                </div>
            )}
           
            
        </>
        
    )
}

export default VisaStatusHR_inprogress;
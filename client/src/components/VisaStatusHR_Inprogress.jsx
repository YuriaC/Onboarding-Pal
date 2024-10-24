import {useState, useEffect} from 'react';
import MyDocument from '../helpers/PdfViewer';
import axios from 'axios';
import { pdfjs } from "react-pdf";


//pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
//Setup woker for pdf loadings
// the original url will cause MMIE issue so use the downloaded version of mjs file
//pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = `http://localhost:3000/workers/pdf.worker.min.mjs`;
//  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//     'pdfjs-dist/build/pdf.worker.min.mjs',
//     import.meta.url,
//   ).toString();
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// // Set the worker source
// pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// fetch('/pdf.worker.min.js')
//   .then((res) => {
//     if (!res.ok) throw new Error('Failed to load worker');
//     console.log('Worker loaded successfully');
//   })
//   .catch((err) => console.error(err));

const VisaStatusHR_inprogress = ()=>{
    
    const today = new Date();
    const [fileDisplayId, setFileDisplayId] = useState();
    const [showFileBtn, setShowFileBtn] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState();


    // for users that holds f1-opt option
    // OPT Receipt should be submitted during onboarding stage
    // OPT EAD, I-983, I-20 should be submitted subsequently.

    const [employees,setEmployees] = useState([]); // Static employee data
    // Fetch all users from the backend API
    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users/alluser');
            setEmployees(response.data); // Store fetched users in state
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

    const haveFileToReview = (user_to_check) =>{
        return user_to_check.optStatus === "Pending" || user_to_check.eadStatus === "Pending" || user_to_check.i983Status === "Pending" || user_to_check.i20Status === "Pending";
    }
    const allFileApproved = (user_to_check) =>{
        return user_to_check.optStatus === "Approved" && user_to_check.eadStatus === "Approved" && user_to_check.i983Status === "Approved" && user_to_check.i20Status === "Approved";
    }

    const stepStatusChecker = (user_tocheck) =>{
        const opt = user_tocheck.optStatus;
        const ead = user_tocheck.eadStatus;
        const i983 = user_tocheck.i983Status;
        const i20 = user_tocheck.i20Status;
        if(opt==="Pending" || opt === "rejected"){
            return "opt";
        }
        if(opt==="Approved" && (ead === "Pending" || ead ==="rejected")){
            return "ead";
        }
        if(opt==="Approved" && ead === "Approved" &&(i983 === "Pending" || i983 ==="rejected")){
            return "i983";
        }
        if(opt==="Approved" && ead === "Approved" && i983 === "Approved" &&(i20 === "Pending" || i20 ==="rejected")){
            return "i20";
        }
        if(allFileApproved(user_tocheck)){
            return "alldone";
        }

    }

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
            if(user.i983Url){
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

    const actionHandler = async(user,decision) =>{
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
            };
            
            if(step_status === "ead"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, eadStatus: decision } : user_itr
                    )
                )
            }
            if(step_status === "i983"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i983Status: decision } : user_itr
                    )
                )
            }
            if(step_status === "i20"){
                setEmployees((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i20Status: decision } : user_itr
                    )
                )
            }
        if(decision === "rejected"){
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

        //modify the changed visa document status for user
        try {
            const response = await axios.post(`http://localhost:3000/api/users/updateworkauthStatus`, {
              id: user._id,
              optStatus: decision
            });
            console.log('User updated:', response.data);
            alert('User updated successfully!');
          } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user.');
          }

    }
    const notificationHandler = async(user) =>{
        //send an email notification to the user
        const step_status = stepStatusChecker(user);
        let message_to_employee = "";
        if(step_status!=="i20"){
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, your submission of ${step_status} has been Approved, please submit the next document.`;
        }else{
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, all of your submitted visa documents has been reviewed and Approved.`;
        }
        
        // console.log(message_to_employee);
        try {
            const response = await axios.post(`http://localhost:3000/api/users/emailNotify`, {
              id: user._id,
              firstName: "balala",
              lastName: user.lastName,
              useremail: user.email,
              notification:message_to_employee
            });
            console.log('Email Notification sent:', response.data);
            alert('Email Notification sent successfully!');
          } catch (error) {
            console.error('Error Email Notification sent:', error);
            alert('Failed to sent Email Notification!');
          }
    }

    const viewFileHandler = (user) =>{
        if(user._id !== fileDisplayId && showFileBtn){
            setFileDisplayId(user._id);
            
        }else{
            setFileDisplayId(null);
        }
        setShowFileBtn(!showFileBtn);
        if(stepStatusChecker(user)==="opt"){
            setCurrentFileUrl(user.optUrl);
        }
        if(stepStatusChecker(user)==="ead"){
            setCurrentFileUrl(user.eadUrl);
        }
        if(stepStatusChecker(user)==="i983"){
            setCurrentFileUrl(user.i983Url);
        }
        if(stepStatusChecker(user)==="i20"){
            setCurrentFileUrl(user.i20Url);
        }
    }
    
    return (
        <>

            <table border="1">
                <thead>
                    <tr>
                        <th colSpan="2">Legal Name</th>
                        <th colSpan="4" >Work Authorization</th>
                        <th rowSpan="2">Next Steps</th>
                        <th rowSpan="2">Action</th>
                    </tr>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Title</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days Remaining</th>
                    </tr>
                </thead>
                <tbody>
                {employees.map((user,index)=>(
                    <tr key={index}>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.workAuth}</td>
                        <td>{formatDateToMDY(user.visaStartDate)}</td>
                        <td>{formatDateToMDY(user.visaEndDate)}</td>
                        <td>{calculateDaysDifference(user.visaEndDate,today)}</td>
                        <td>{nextstepsHandler(user)}
                            { haveFileToReview(user) && (<button onClick={()=>viewFileHandler(user)}>{fileDisplayId === user._id ? 'Hide' : 'Show'} Submitted File</button>)}
                            { !allFileApproved(user) && (<button onClick={()=>notificationHandler(user)}>Send Notification</button>)}
                        </td>
                        <td>
                            {!allFileApproved(user) &&
                            (<div>
                                <button onClick={() => actionHandler(user,'Approved')}>Approve</button>
                                <button onClick={() => actionHandler(user,'rejected')}>Reject</button>
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
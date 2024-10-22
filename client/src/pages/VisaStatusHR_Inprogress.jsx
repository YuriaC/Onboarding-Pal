import {useState, useEffect} from 'react';
import MyDocument from './PdfViewer';
import { pdfjs } from "react-pdf";

//dummy_user for local testing without bn data flows
const startdate = new Date(2023, 9, 12);
const enddate = new Date(2025, 9, 12);
const dummy_user = [
    {
        _id:1,
        firstName:"dummy1",
        lastName:"dummy1lastname",
        workAuth:"f1",
        visaStartDate:startdate,
        visaEndDate:enddate,
        workAuthFile_url:"http://localhost:3000/pdfs/dummy.pdf",
        optStatus:"approved",
        eadStatus:"approved",
        i983Status:"approved",
        i20Status:"approved",
    },
    {
        _id:2,
        firstName:"dummy2",
        lastName:"dummy1lastname",
        workAuth:"OPT",
        visaStartDate:startdate,
        visaEndDate:enddate,
        workAuthFile_url:"http://localhost:3000/pdfs/dummy.pdf",
        optStatus:"approved",
        eadStatus:"pending",
        i983Status:"pending",
        i20Status:"pending",
    },
    {
        _id:3,
        firstName:"dummy2",
        lastName:"dummy1lastname",
        workAuth:"OPT",
        visaStartDate:startdate,
        visaEndDate:enddate,
        workAuthFile_url:"http://localhost:3000/pdfs/dummy.pdf",
        optStatus:"pending",
        eadStatus:"pending",
        i983Status:"pending",
        i20Status:"pending",
    },
    {
        _id:4,
        firstName:"dummy4",
        lastName:"dummy1lastname",
        workAuth:"OPT",
        visaStartDate:startdate,
        visaEndDate:enddate,
        workAuthFile_url:"http://localhost:3000/pdfs/dummy.pdf",
        eadUrl:"http://localhost:3000/pdfs/dummy.pdf",
        i983Url:"http://localhost:3000/pdfs/dummy.pdf",
        i20Url:"http://localhost:3000/pdfs/dummy.pdf",
        optStatus:"pending",
        eadStatus:"pending",
        i983Status:"pending",
        i20Status:"pending",
    }
]

//Setup woker for pdf loadings
// the original url will cause MMIE issue so use the downloaded version of mjs file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const VisaStatusHR_inprogress = ()=>{
    
    const today = new Date();
    const [users,setUsers] = useState(dummy_user);
    const [showNotifyBtn, setShowNotifyBtn] = useState(true);
    const [notifyID, setNotifyID] = useState();
    const [fileDisplayId, setFileDisplayId] = useState();
    const [showFileBtn, setShowFileBtn] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState();
    const [showInprogress, setShowInprogress] = useState(true);


    // for users that holds f1-opt option
    // OPT Receipt should be submitted during onboarding stage
    // OPT EAD, I-983, I-20 should be submitted subsequently.

    
    //const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const pdfFile="http://localhost:3000/pdfs/dummy.pdf";

    const formatDateToMDY = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
        const year = date.getFullYear();
      
        return `${month}/${day}/${year}`;
    }

    const calculateDaysDifference = (endDate, currentDate) => {
        // Convert both dates to milliseconds
        const timeDiff = endDate - currentDate; // Absolute difference to avoid negative values
        // Convert milliseconds to days (1 day = 24 * 60 * 60 * 1000 ms)
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return dayDiff;
    }

    const haveFileToReview = (user_to_check) =>{
        return user_to_check.optStatus === "pending" || user_to_check.eadStatus === "pending" || user_to_check.i983Status === "pending" || user_to_check.i20Status === "pending";
    }
    const allFileApproved = (user_to_check) =>{
        return user_to_check.optStatus === "approved" && user_to_check.eadStatus === "approved" && user_to_check.i983Status === "approved" && user_to_check.i20Status === "approved";
    }

    const stepStatusChecker = (user_tocheck) =>{
        const opt = user_tocheck.optStatus;
        const ead = user_tocheck.eadStatus;
        const i983 = user_tocheck.i983Status;
        const i20 = user_tocheck.i20Status;
        if(opt==="pending" || opt === "rejected"){
            return "opt";
        }
        if(opt==="approved" && (ead === "pending" || ead ==="rejected")){
            return "ead";
        }
        if(opt==="approved" && ead === "approved" &&(i983 === "pending" || i983 ==="rejected")){
            return "i983";
        }
        if(opt==="approved" && ead === "approved" && i983 === "approved" &&(i20 === "pending" || i20 ==="rejected")){
            return "i20";
        }
        if(allFileApproved(user_tocheck)){
            return "alldone";
        }

    }

    const nextstepsHandler = (user)=>{
        // checks user status if pending then pop to set next steps
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
            if(user.workAuthFile_url){
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

    
    const actionHandler = (user,decision) =>{
        // action1: files submitted, need review to approve or reject (when reject send message to user management)
        // action2: submit the next document, send reminder to the user
        // approve/reject
        const step_status = stepStatusChecker(user);
            //user set corresponding status to approve // api call to update the database
            if(step_status === "opt"){
                setUsers((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, optStatus: decision } : user_itr
                    )
                )
            };
            
            if(step_status === "ead"){
                setUsers((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, eadStatus: decision } : user_itr
                    )
                )
            }
            if(step_status === "i983"){
                setUsers((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i983Status: decision } : user_itr
                    )
                )
            }
            if(step_status === "i20"){
                setUsers((prevUsers) =>
                    prevUsers.map((user_itr) =>
                        user_itr._id === user._id ? { ...user_itr, i20Status: decision } : user_itr
                    )
                )
            }
        if(decision === "rejected"){
            //if rejected, send this message to the employee side to remind resubmission.
            console.log(`Hello ${user.firstName} ${user.lastName}, your submitted file for ${step_status} has been rejected by HR, please resubmit.`)
        }

    }
    const notificationHandler = (user) =>{
        //send an email notification to the user
        const step_status = stepStatusChecker(user);
        let message_to_employee = "";
        if(step_status!=="i20"){
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, your submission of ${step_status} has been approved, please submit the next document.`;
        }else{
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, all of your submitted visa documents has been reviewed and approved.`;
        }
        console.log(message_to_employee);
    }

    const viewFileHandler = (user) =>{
        console.log(user._id);
        if(user._id !== fileDisplayId){
            setFileDisplayId(user._id);
            
        }else{
            setFileDisplayId(null);
        }

        setShowFileBtn(!showFileBtn);
        setCurrentFileUrl(user.workAuthFile_url);
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
                {users.map((user,index)=>(
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
                                <button onClick={() => actionHandler(user,'approved')}>Approve</button>
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
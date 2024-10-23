import {useState, useEffect} from 'react';
import axios from 'axios';
import MyDocument from './PdfViewer';
import { pdfjs } from "react-pdf";


//Setup woker for pdf loadings
// the original url will cause MMIE issue so use the downloaded version of mjs file
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = `http://localhost:3000/workers/pdf.worker.min.mjs`;
const VisaStatusHR_all = ()=>{
    const today = new Date();
    const [fileDisplayId, setFileDisplayId] = useState();
    const [showFileBtn, setShowFileBtn] = useState(false);
    const [currentFileUrl, setCurrentFileUrl] = useState();
    //const [submittedDoc, setSubmittedDoc] = useState({});

    //const [employees] = useState(dummy_user); // Static employee data
    const [search, setSearch] = useState({
        firstName: '',
        lastName: '',
        preferredName: '',
    });
    // for users that holds f1-opt option
    // OPT Receipt should be submitted during onboarding stage
    // OPT EAD, I-983, I-20 should be submitted subsequently.

    //const startdate = new Date(2023, 9, 12);
    //const enddate = new Date(2025, 9, 12);
    //const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    //const pdfFile="http://localhost:3000/pdfs/dummy.pdf";

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
    const notificationHandler = async(user) =>{
        //send an email notification to the user
        const step_status = stepStatusChecker(user);
        let message_to_employee = "";
        if(step_status!=="i20"){
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, your submission of ${step_status} has been approved, please submit the next document.`;
        }else{
            message_to_employee = `Hello ${user.firstName} ${user.lastName}, all of your submitted visa documents has been reviewed and approved.`;
        }
        //console.log(message_to_employee);
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
    

    const downloadPdf = async (pdfUrlDownload) => {
        try {
          const response = await fetch(pdfUrlDownload);
          if (!response.ok) throw new Error('Failed to fetch PDF');
    
          const blob = await response.blob(); // Convert response to Blob
          const url = URL.createObjectURL(blob); // Create URL for the Blob
    
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = url;
          link.download = 'downloaded-file.pdf'; // Set download attribute
          document.body.appendChild(link); // Append to body
    
          // Trigger the download by simulating a click
          link.click();
    
          // Cleanup
          document.body.removeChild(link);
          URL.revokeObjectURL(url); // Free up memory
        } catch (error) {
          console.error('Error downloading PDF:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearch((prevSearch) => ({
            ...prevSearch,
            [name]: value.toLowerCase(),
        }));
    };

    // Filter employees based on the search input
    const filteredEmployees = employees.filter((employee) =>
        (employee.firstName.toLowerCase().includes(search.firstName) &&
            employee.lastName.toLowerCase().includes(search.lastName) &&
            employee.preferredName.toLowerCase().includes(search.preferredName))
        );
    return (
        <>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="Search by First Name"
                    value={search.firstName}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Search by Last Name"
                    value={search.lastName}
                    onChange={handleInputChange}
                    style={{ marginLeft: '10px' }}
                />
                <input
                    type="text"
                    name="preferredName"
                    placeholder="Search by Preferred Name"
                    value={search.preferredName}
                    onChange={handleInputChange}
                    style={{ marginLeft: '10px' }}
                />
             </div>

            <table border="1">
                <thead>
                    <tr>
                        <th colSpan="2">Legal Name</th>
                        <th colSpan="4" >Work Authorization</th>
                        <th rowSpan="2">Next Steps</th>
                        <th rowSpan="2">Documents Submitted</th>
                        
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
                    {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((user) => (
                        <tr key={user._id}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.workAuth}</td>
                            <td>{formatDateToMDY(user.visaStartDate)}</td> 
                            <td>{formatDateToMDY(user.visaEndDate)}</td>
                            <td>{calculateDaysDifference(user.visaEndDate,today)}</td>
                            <td>{nextstepsHandler(user)}
                                { haveFileToReview(user) && (<button onClick={()=>viewFileHandler(user)}>{} Submitted File</button>)}
                                { !allFileApproved(user) && (<button onClick={()=>notificationHandler(user)}>Send Notification</button>)}
                            </td>
                            <td>
                                {user.optUrl &&  (<button onClick={()=>viewFileHandler(user)}>{} OPT Receipt</button>)}
                                {user.optUrl &&  (<button onClick={()=>downloadPdf(user.optUrl)}>Download OPT PDF</button>)}

                                {user.eadUrl &&  (<button onClick={()=>viewFileHandler(user)}>{} EAD </button>)}
                                {user.eadUrl &&  (<button onClick={()=>downloadPdf(user.eadUrl)}>Download EAD PDF</button>)}

                                {user.i983Url &&  (<button onClick={()=>viewFileHandler(user)}>{} I983</button>)}
                                {user.i983Url &&  (<button onClick={()=>downloadPdf(user.i983Url)}>Download I983 PDF</button>)}

                                {user.i20Url &&  (<button onClick={()=>viewFileHandler(user)}>{} I20</button>)}
                                {user.i20Url &&  (<button onClick={()=>downloadPdf(user.i20Url)}>Download I20 PDF</button>)}
                            </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="2" style={{ textAlign: 'center' }}>
                        No results found.
                        </td>
                    </tr>
                    )}
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

export default VisaStatusHR_all;
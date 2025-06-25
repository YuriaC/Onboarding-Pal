import {useState, useEffect} from 'react';
import axios from 'axios';
// import MyDocument from '../helpers/PdfViewer';
import { pdfjs } from "react-pdf";
import { BACKEND_BASEURL, API_BASE_URL, docNames, docStatuses, docUrls, USER_ENDPOINT } from '../constants';
import { Box, Button, TextField, Typography } from '@mui/material'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';

//Setup woker for pdf loadings
// the original url will cause MMIE issue so use the downloaded version of mjs file
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = `${BACKEND_BASEURL}/workers/pdf.worker.min.mjs`;
const VisaStatusHR_all = ()=>{
    const today = new Date();
    const navigate = useNavigate()

    //const [employees] = useState(dummy_user); // Static employee data
    const [search, setSearch] = useState({
        firstName: '',
        lastName: '',
        preferredName: '',
    });
    // for users that holds f1-opt option
    // OPT Receipt should be submitted during onboarding stage
    // OPT EAD, I-983, I-20 should be submitted subsequently.

    //const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    //const pdfFile="http://localhost:3000/workers/dummy.pdf";

    const [employees,setEmployees] = useState([]); // Static employee data
    // Fetch all users from the backend API
    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/alluser`);
            const { data } = response
            const newEmployees = []
            for (const employee of data) {
                let needSubmitNext = true
                let docToReview = ''
                let currDoc = ''
                let currDocName = ''
                let nextDocName = ''
                const employeeDocs = await axios.get(`${USER_ENDPOINT}/getuserdocs/${employee._id}`, { withCredentials: true })
                let newDocs = {}
                for (let i = 0; i < docStatuses.length; i++) {
                    if (employee[docStatuses[i]] === 'Approved') {
                        newDocs = {
                            ...newDocs,
                            [docUrls[i]]: employeeDocs.data[docUrls[i]]
                        }
                    }
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
                }
                const newEmployee = {
                    ...employee,
                    needSubmitNext,
                    docs: employeeDocs.data,
                    approvedDocs: newDocs,
                    docToReview,
                    currDoc,
                    // nextDoc,
                    nextDocName,
                    currDocName,
                }
                newEmployees.push(newEmployee)
            }
            setEmployees(newEmployees); // Store fetched users in state
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
        };

        fetchUsers();
    }, []);

    const formatDateToMDY = (date) => {
        if(date){
            const dateobj = new Date(date);
            const month = String(dateobj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(dateobj.getDate()).padStart(2, '0'); // Ensure 2-digit day
            const year = dateobj.getFullYear();
            return `${month}/${day}/${year}`;
        }
        return "N/A"
        
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
        return "N/A"
    }

    const allFileApproved = (user_to_check) =>{
        return user_to_check.optStatus === "Approved" && user_to_check.eadStatus === "Approved" && user_to_check.i983Status === "Approved" && user_to_check.i20Status === "Approved";
    }

    const urlToName = (url) => {
        switch (url) {
            case 'optUrl':
                return 'OPT'
            case 'eadUrl':
                return 'OPT EAD'
            case 'i983Url':
                return 'I-983'
            case 'i20Url':
                return 'I-20'
        }
        return 'Something'
    }
    

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
            <Box sx={{ margin: '0 auto 1rem auto', padding: '1rem 0 0 .5rem', display: 'flex', flexDirection: 'row', gap: 1}}>
                <TextField
                    type="text"
                    name="firstName"
                    label="First Name"
                    variant='outlined'
                    placeholder="First Name"
                    value={search.firstName}
                    onChange={handleInputChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    style={{background: "white"}}
                />
                <TextField
                    type="text"
                    name="lastName"
                    label="Last Name"
                    variant='outlined'
                    placeholder="Last Name"
                    value={search.lastName}
                    onChange={handleInputChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    style={{background: "white"}}
                />
                <TextField
                    type="text"
                    name="preferredName"
                    label="Preferred Name"
                    variant='outlined'
                    placeholder="Preferred Name"
                    value={search.preferredName}
                    onChange={handleInputChange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    style={{background: "white"}}
                />
             </Box>
             <Typography>{filteredEmployees.length === 0 ? 'No records found' : filteredEmployees.length === 1 ? 'One record found' : 'Multiple records found'}</Typography>
            <Box sx={{ 
                height: '400px', 
                margin: 'auto',
                padding: '.5rem',
            }}>
            <TableContainer component={Paper}>
            <Table sx={{
                    width: '90%', // Set a smaller minimum width
                    overflow: 'visible', // Ensure no scrollbars
                    height: '40vh',
                    borderRadius: '5px',
                    boxShadow: '3px'
                    }}  aria-label="simple table">
                <TableHead>
                <TableRow>
                        <TableCell colSpan="3">Legal Name</TableCell>
                        <TableCell colSpan="4" >Work Authorization</TableCell>
                        <TableCell rowSpan="2">Next Steps</TableCell>
                        <TableCell rowSpan="2">Submitted Documents</TableCell>
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
                    {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((user) => (
                        <TableRow key={user._id}>
                            <TableCell>{user.firstName}</TableCell>
                            <TableCell>{user.middleName}</TableCell>
                            <TableCell>{user.lastName}</TableCell>
                            <TableCell>{user.isPermRes === 'Yes' ? user.permResStatus : user.workAuth !== 'Other' ? user.workAuth : user.visaTitle ? user.visaTitle : 'Other (Unspecified)'}</TableCell>
                            <TableCell>{formatDateToMDY(user.visaStartDate)}</TableCell> 
                            <TableCell>{formatDateToMDY(user.visaEndDate)}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{calculateDaysDifference(user.visaEndDate,today) < 0 ? 'Expired' : calculateDaysDifference(user.visaEndDate,today)}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                            <TableCell>
                                {docUrls.map((docUrl) => {
                                    if (!(docUrl in user.approvedDocs)) {
                                        return (<></>)
                                    }
                                    return (
                                        <>
                                            <Box>
                                                <Button href={user.approvedDocs[docUrl]?.preview} target='_blank' sx={{ width: '10rem', justifyContent: 'start' }}>Preview {urlToName(docUrl)}</Button>

                                                <Button href={user.approvedDocs[docUrl]?.download}>Download {urlToName(docUrl)}</Button>
                                            </Box>
                                        </>
                                    )
                                })}
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan="9" style={{ textAlign: 'center' }}>
                        No results found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>

            </Table>
            </TableContainer>
            </Box>
        </>
    )
}

export default VisaStatusHR_all;
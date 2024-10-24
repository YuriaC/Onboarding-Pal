import { useState, useEffect } from 'react'
import { docNames, docStatuses, docUrls, TEST_ENDPOINT, USER_ENDPOINT } from '../constants'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'
import { Container, Typography, Box, Card, CardContent, CardHeader, TextField, InputLabel, Button } from '@mui/material'

const VisaStatusEmployees = () => {
    // only apply to employee OPT visa status
    const [viewSection, setViewSection] = useState({
        viewOPT: false,
        viewEAD: false,
        viewI983: false,
        viewI20: false
    });

    const [visaInfo, setVisaInfo] = useState({
        workAuth: '',
        optStatus: '',  // OPT receipt status
        eadStatus: '',
        i983Status: '',
        i20Status: '',
        optUrl: '',  // OPT receipt file URL
        eadUrl: '',
        i983Url: '',
        i20Url: '',
        hrVisaFeedBack: ''
    })
    
    const [files, setFiles] = useState([])

    const [docStatusInfo, setDocStatusInfo] = useState({})
    // const [employeeInfo, setEmployeeInfo] = useState({})
    const [docs, setDocs] = useState({})
    const [employeeId, setEmployeeId] = useState()
    const [changed, setChanged] = useState(false)

    const [fileToSubmit, setFileToSubmit] = useState()
    
    const testGetURL = `${TEST_ENDPOINT}/visa`;
    const testPostURL = `${TEST_ENDPOINT}/postVisa`;

    const deploymentURL = `${USER_ENDPOINT}/userinfo`

    // get uploaded file
    // const getDocs = async () => {
    //     const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     })
    //     setDocs(response.data)
    //     console.log('response:', response)
    // }

    useEffect(() => {
        axios.get(deploymentURL, { withCredentials: true }) // test
            .then(response => {
                const { workAuth } = response.data
                console.log('response:', response)
                const optUrl = response.data.optUrl;
                const eadUrl = response.data.eadUrl;
                const i983Url = response.data.i983Url;
                const i20Url = response.data.i20Url;
                const optStatus = response.data.optStatus;
                const eadStatus = response.data.eadStatus;  
                const i983Status = response.data.i983Status;
                const i20Status = response.data.i20Status;
                const hrVisaFeedBack = response.data.hrVisaFeedBack;

                setViewSection({  // update view options
                    viewOPT: optStatus === 'Not Started' ? false : true,
                    viewEAD: eadStatus === 'Not Started' ? false : true,
                    viewI983: i983Status === 'Not Started' ? false : true,
                    viewI20: i20Status === 'Not Started' ? false : true,
                });

                // getDocs();  // fetch documents
                    
                setVisaInfo({  // update visa info state
                    workAuth,
                    optStatus,
                    eadStatus,
                    i983Status,
                    i20Status,
                    optUrl, 
                    eadUrl,
                    i983Url,
                    i20Url,
                    hrVisaFeedBack,
                });

                let currDocUrl = ''
                let currDocStatus = ''
                let currDocName = ''
                for (let i = 0; i < docStatuses.length; i++) {
                    if (['Pending', 'Rejected', 'Not Started'].includes(response.data[docStatuses[i]])) {
                        currDocUrl = docUrls[i]
                        currDocStatus = docStatuses[i]
                        currDocName = docNames[i]
                        break
                    }
                }
                const currDocInfo = {
                    currDocName,
                    currDocStatus,
                    currDocUrl,
                }
                console.log('currDocInfo:', currDocInfo)
                setDocStatusInfo(currDocInfo)
                setEmployeeId(response.data._id)
                axios.get(`${USER_ENDPOINT}/getuserdocs/${response.data._id}`, { withCredentials: true })
                    .then(response => {
                        // console.log('response:', response)
                        setDocs(response.data)
                    })
                // const newEmployeeData = {
                //     ...employee,
                //     needSubmitNext,
                //     isRejecting: false,
                //     docs: userDocs.data,
                //     docToReview,
                //     currDoc,
                //     // nextDoc,
                //     nextDocName,
                // }
                // newData.push(newEmployeeData)
            })
            .catch((err) => {
                console.error(`Error fetching visa info! Error: ${err.message}`)
            })
    }, [changed])

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFiles(prevFiles => ({
            ...prevFiles,
            [name]: files // Store files using input tag name as key
        }));
    };

    const buildFormData = (formData, data, parentKey) => {
        if (data && typeof data === 'object' && !(data instanceof FileList)) {
            Object.keys(data).forEach(key => {
                buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
            });
        } else if (data instanceof FileList) {
            
            console.log('file detected')  // debug

            Array.from(data).forEach((file, index) => {
                console.log(`parent key name is: ${parentKey}[${index}]`);   // debug
                formData.append(`${parentKey}[${index}]`, file);
            });
        } else {
            formData.append(parentKey, data);
        }
    };
    
    const generateFormData = (data, files) => {
        const formData = new FormData();
        buildFormData(formData, data);  // sync data from visaInfo state
        
        Object.keys(files).forEach(key => {
            buildFormData(formData, files[key], key);  // Append files under their respective form field name
        });

        // formData.append('username', username)
        return formData;
    }

    const viewToggler = (formName) => {  // helper function that updates view after submissions
        let updatedStatus = {};
        let toggleView = '';

        switch (formName) {
            case "eadSubmit":
                updatedStatus = {"eadStatus" : "Pending"};
                // TO-DO: url update
                toggleView = 'viewEAD';
                break;
            case "i983Submit":
                updatedStatus = {"i983Status" : "Pending"};
                toggleView = 'viewI983';
                break;
            case "i20Submit":
                updatedStatus = {"i20Status" : "Pending"};
                toggleView = 'viewI20';
                break;
            
            default:
                console.error('Invalid form submission');
                return ['', ''];  // Exit if formName does not match
        }

        return [updatedStatus, toggleView]
    }
      
    const createFormData = (data) => {
        const formData = new FormData();
        buildFormData(formData, data);
        formData.append('onboardingStatus', 'Pending')
        return formData;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // const formName = e.target.id;

        // const [updatedStatus, toggleView] = viewToggler(formName);

        // const updatedVisaInfo = {
        //     ...visaInfo,
        //     ...updatedStatus,
        // };

        const oldData = {
            ...docStatusInfo,
            // file: fileToSubmit,
        }

        console.log('oldData:', oldData)

        // setVisaInfo(updatedVisaInfo);
        // const data = generateFormData(updatedVisaInfo, files);
        const data = createFormData(oldData)
        data.append('file', fileToSubmit)

        try {
            const response = await axios.put(`${USER_ENDPOINT}/uploadworkdoc/${employeeId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',  // for file transfer
                },
                withCredentials: true,
            })

            console.log('response:', response)

            setChanged(!changed)
            toast.success('Successfully uploaded file!')

            // setViewSection({...viewSection, [toggleView] : true});  // display uploaded documentation
            // console.log("File uploaded successfully!");  // debug
            // console.log(response.data.message);  // debug
        }
        catch (err) {
            toast.error(`Error submitting application! Error: ${err.response}`)
            // console.error(`Error submitting application! Error: ${err.response}`)
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        const file = e.target.files[0]
        setFileToSubmit(file)
    }

    return (
        <Container maxWidth="md" sx={{marginTop: 15}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
            <h2>OPT Status Page</h2>
            {visaInfo.workAuth !== 'F1(CPT/OPT)' ? <Typography variant='h3'>Only for F1(CPT/OPT) work authorizations</Typography> : <div>
                {/* employees with non-OPT status or those who got all OPT documentations see the following */}
                {!viewSection.viewOPT && 
                    <p>This page is for OPT related documentations only.</p>
                }

                {/* OPT related rendering logic */}
                {viewSection.viewOPT && <fieldset className='opt'>
                    <h3 className="statusSummary">Your OPT receipt status is {visaInfo.optStatus}</h3>
                    {visaInfo.optStatus === 'Pending' && 
                        <p>Waiting for HR to approve your OPT Receipt</p>
                    }

                    {visaInfo.optStatus === 'Approved' &&
                        <>
                            {/* <p>Your OPT receipt has been approved!</p> */}
                            <Typography variant='h5' sx={{ color: 'green' }}>Your OPT receipt has been approved!</Typography>
                            {/* <p>Please upload a copy of your OPT EAD!</p> */}
                            {/* <Typography variant='h6'>Please upload a copy of your OPT EAD!</Typography> */}
                        </>
                    }

                    {visaInfo.optStatus === 'Rejected' && 
                        <>
                            {/* <p>Your OPT receipt has been rejected. Below is your HR's feedback: </p> */}
                            {/* <Typography variant='h5' sx={{ color: 'red' }}>Your OPT receipt has been rejected</Typography> */}
                            {/* {visaInfo.hrVisaFeedBack &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrVisaFeedBack}</h4>
                                </div>
                            } */}
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                    <CardHeader title='Feedback given:' sx={{ paddingBottom: 0 }} />
                                    <CardContent>
                                        <Typography variant='body1'>
                                            {visaInfo.hrVisaFeedBack || 'No feedback given'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <InputLabel>Please reupload your document again</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Reupload</Button>
                                </form>
                            </Box>
                        </>
                    }

                    {/* view uploaded OPT documentation  */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            {/* <p> Below is your submitted OPT receipt. </p> */}

                            {/* temporary display for testing. Subject to change */}
                            {/* <a href={visaInfo.optUrl} target="_blank">OPT Receipt Submission</a> */}
                            <Button href={docs.optUrl?.preview} target='_blank'>View OPT Submission</Button>
                        </div>
                    }

                    {/* ead submission */}
                    {visaInfo.optStatus === 'Approved' && visaInfo.eadStatus === 'Not Started' && 
                        <form id="eadSubmit" onSubmit={handleSubmit}>
                            {/* <label htmlFor="ead">Please upload photocopies of the front and the back of your OPT EAD.</label> <br></br> */}
                            {/* <input type="file" name="eadFront" id="optReceipt"/>
                            <input type="file" name="eadBack" id="eadBack"/> */}
                            {/* <input type="file" id="ead" name="ead" multiple onChange={handleFileChange} required />
                            <button type="submit">Submit</button>  */}
                            <Box>
                                {/* <form onSubmit={handleSubmit}> */}
                                    <InputLabel>Please upload a copy of your OPT EAD</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Upload</Button>
                                {/* </form> */}
                            </Box>
                        </form>
                    }
                </fieldset>}


                {/* EAD related rendering logic */}
                {viewSection.viewEAD && <fieldset className='ead'>
                    <h3 className="statusSummary">Your EAD status is {visaInfo.eadStatus}</h3>
                    {visaInfo.eadStatus === 'Pending' && 
                        <p>Waiting for HR to approve your OPT EAD</p>
                    }

                    {visaInfo.eadStatus === 'Approved' && 
                        <p>Your EAD has been approved!</p>
                    }

                    {visaInfo.eadStatus === 'Rejected' && 
                        <>
                            <p>Your EAD is rejected. Below is your HR's feedback</p>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                    <CardHeader title='Feedback given:' sx={{ paddingBottom: 0 }} />
                                    <CardContent>
                                        <Typography variant='body1'>
                                            {visaInfo.hrVisaFeedBack || 'No feedback given'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <InputLabel>Please reupload your {docStatusInfo.currDocName} again</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Reupload</Button>
                                </form>
                            </Box>
                        </>                    
                    }

                    {/* view uploaded EAD documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            {/* <p> Below is your submitted EAD. </p> */}

                            {/* temporary display for testing. Subject to change */}
                            {/* <a href={visaInfo.eadUrl}>EAD Submission</a> */}
                            <Button href={docs.eadUrl?.preview} target='_blank'>View OPT EAD Submission</Button>
                        </div>
                    }

                    {/* I983 Submission */}
                    {visaInfo.eadStatus === 'Approved' && visaInfo.i983Status === 'Not Started' &&
                        <form id='i983Submit' onSubmit={handleSubmit}>
                            {/* <label htmlFor="i983">Please download and fill out the I-983 form. </label> <br></br> */}
                            <Typography>Please download and fill out the I-983 form</Typography>
                            <Button href={docs['Empty Template']?.download}>Download Empty Template</Button>
                            <Button href={docs['Sample Template']?.download}>Download Sample Template</Button>
                            {/* download form  */}
                            {/* <input type="file" name="i983" id="i983" onChange={handleFileChange} required/>
                            <button type="submit">Submit</button>  */}
                            <Box>
                                {/* <form onSubmit={handleSubmit}> */}
                                    <InputLabel>Please upload a copy of your filled-out I-983</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Upload</Button>
                                {/* </form> */}
                            </Box>
                        </form>
                    }
                </fieldset>}


                {/* I983 related rendering logic */}
                {viewSection.viewI983 && <fieldset className='i983'>
                    <h3 className="statusSummary">Your I-983 status is {visaInfo.i983Status}</h3>
                    {visaInfo.i983Status === 'Pending' && 
                        <p>Waitin for HR to approve and sign your I-983</p>
                    }

                    {visaInfo.i983Status === 'Approved' && 
                        <p>Your form I-983 has been approved!</p>
                    }

                    {visaInfo.i983Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your feedback from HR</p>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                    <CardHeader title='Feedback given:' sx={{ paddingBottom: 0 }} />
                                    <CardContent>
                                        <Typography variant='body1'>
                                            {visaInfo.hrVisaFeedBack || 'No feedback given'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Button href={docs['Empty Template'].download}>Download Empty Template</Button>
                            <Button href={docs['Sample Template'].download}>Download Sample Template</Button>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <InputLabel>Please reupload your {docStatusInfo.currDocName} again</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Reupload</Button>
                                </form>
                            </Box>
                        </>                    
                    }

                    {/* view uploaded I-983 documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            {/* <p> Below is your submitted form I-983. </p> */}

                            {/* temporary display for testing. Subject to change */}
                            {/* <a href={visaInfo.i983Url}>I-983 Submission</a> */}
                            <Button href={docs.i983Url?.preview} target='_blank'>View I-983 Submission</Button>
                        </div>
                    }

                    {/* I20 Submission */}
                    {visaInfo.i983Status === 'Approved' && visaInfo.i20Status === 'Not Started' && 
                        <form id='i20Submit' onSubmit={handleSubmit}>
                            <label htmlFor="i20">Please send the I-983 along with all necessary documents to your school 
                                and upload the new I-20.
                            </label> <br></br>
                            {/* <input type="file" name="i20" id="i20" onChange={handleFileChange} required /> */}
                            {/* <button type="submit">Submit</button>  */}
                            <Box>
                                {/* <form onSubmit={handleSubmit}> */}
                                    <InputLabel>Please upload a copy of your I-20</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Upload</Button>
                                {/* </form> */}
                            </Box>
                        </form>
                    }
                </fieldset>}


                {/* I20 related rendering logic */}
                {viewSection.viewI20 && <fieldset className='i20'>
                    <h3 className="statusSummary">Your I-20 status is {visaInfo.i20Status}</h3>
                    {visaInfo.i20Status === 'Pending' &&
                        <p>Waiting for HR to approve your I-20</p>
                    }

                    {visaInfo.i20Status === 'Approved' &&
                        <p>All documents have been approved</p>
                    }

                    {visaInfo.i20Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your HR's feedback</p>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Card sx={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                                    <CardHeader title='Feedback given:' sx={{ paddingBottom: 0 }} />
                                    <CardContent>
                                        <Typography variant='body1'>
                                            {visaInfo.hrVisaFeedBack || 'No feedback given'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <InputLabel>Please reupload your {docStatusInfo.currDocName} again</InputLabel>
                                    <TextField type='file' onChange={handleChange} fullWidth sx={{ mb: 2 }} required></TextField>
                                    <Button type='submit' fullWidth>Reupload</Button>
                                </form>
                            </Box>
                        </>                    
                    }

                    {/* view uploaded I-20 documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            {/* <p> Below is your submitted form I-20. </p> */}

                            {/* temporary display for testing. Subject to change */}
                            {/* <a href={visaInfo.i20Url}>I-20 Submission</a> */}
                            <Button href={docs.i20Url?.preview} target='_blank'>View I-20 Submission</Button>
                        </div>
                    }
                </fieldset>}
                <ToastContainer />
            </div>}
            </Box>
        </Container>
    )
}

export default VisaStatusEmployees
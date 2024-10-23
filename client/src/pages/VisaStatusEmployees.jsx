import { useState, useEffect } from 'react'
import { token, TEST_ENDPOINT, USER_ENDPOINT, username } from '../constants'
// import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'

const VisaStatusEmployees = () => {
    // only apply to employee OPT visa status
    const [viewSection, setViewSection] = useState({
        viewOPT: false,
        viewEAD: false,
        viewI983: false,
        viewI20: false
    });

    const [visaInfo, setVisaInfo] = useState({
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
        // axios.get(deploymentURL, {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // })

        axios.get(testGetURL) // test

        .then(response => {
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
                optStatus: optStatus,
                eadStatus: eadStatus,
                i983Status: i983Status,
                i20Status: i20Status,
                optUrl: optUrl, 
                eadUrl: eadUrl,
                i983Url: i983Url,
                i20Url: i20Url,
                hrVisaFeedBack: hrVisaFeedBack
            });  
        })
        .catch((err) => {
            console.error(`Error fetching visa info! Error: ${err.message}`)
        })
    }, [])

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formName = e.target.id;

        const [updatedStatus, toggleView] = viewToggler(formName);

        const updatedVisaInfo = {
            ...visaInfo,      
            ...updatedStatus, 
        };

        setVisaInfo(updatedVisaInfo);
        const data = generateFormData(updatedVisaInfo, files);

        try {
            // // for deployment
            // await axios.post(testPostURL, data, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',  // for file transfer
            //         'Authorization': `Bearer ${token}`,
            //     }
            // })

            const response = await axios.post(testPostURL, data, {  // for testing
                    headers: {
                        'Content-Type': 'multipart/form-data',  // for file transfer
                    }
            })

            setViewSection({...viewSection, [toggleView] : true});  // display uploaded documentation
            console.log("File uploaded successfully!");  // debug
            console.log(response.data.message);  // debug
        }
        catch (err) {
            console.error(`Error submitting application! Error: ${err.response}`)
        }
    }

    return (
        <>
            <h2>OPT Status Page</h2>
            <div>
                {/* employees with non-OPT status or those who got all OPT documentations see the following */}
                {!viewSection.viewOPT && 
                    <p>This page is for OPT related documentations only.</p>
                }

                {/* OPT related rendering logic */}
                {viewSection.viewOPT && <fieldset className='opt'>
                    <h3 className="statusSummary">Your OPT receipt status is {visaInfo.optStatus}</h3>
                    {visaInfo.optStatus === 'Pending' && 
                        <p>OPT receipt submitted in onboarding application. Please wait for HR approval.</p>
                    }

                    {visaInfo.optStatus === 'Approved' && 
                        <p>Your OPT receipt has been approved!</p>
                    }

                    {visaInfo.optStatus === 'Rejected' && 
                        <>
                            <p>Your OPT receipt is rejected. Below is your HR's feedback: </p>
                            {visaInfo.hrVisaFeedBack &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrVisaFeedBack}</h4>
                                </div>
                            }
                        </>                    
                    }

                    {/* view uploaded OPT documentation  */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            <p> Below is your submitted OPT receipt. </p>

                            {/* temporary display for testing. Subject to change */}
                            <a href={visaInfo.optUrl} target="_blank">OPT Receipt Submission</a>
                        </div>
                    }

                    {/* ead submission */}
                    {visaInfo.optStatus === 'Approved' && visaInfo.eadStatus === 'Not Started' && 
                        <form id="eadSubmit" onSubmit={handleSubmit}>
                            <label htmlFor="ead">Please upload photocopies of the front and the back of your OPT EAD.</label> <br></br>
                            {/* <input type="file" name="eadFront" id="optReceipt"/>
                            <input type="file" name="eadBack" id="eadBack"/> */}
                            <input type="file" id="ead" name="ead" multiple onChange={handleFileChange} required />
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* EAD related rendering logic */}
                {viewSection.viewEAD && <fieldset className='ead'>
                    <h3 className="statusSummary">Your EAD status is {visaInfo.eadStatus}</h3>
                    {visaInfo.eadStatus === 'Pending' && 
                        <p>EAD submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.eadStatus === 'Approved' && 
                        <p>Your EAD has been approved!</p>
                    }

                    {visaInfo.eadStatus === 'Rejected' && 
                        <>
                            <p>Your EAD is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrVisaFeedBack &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrVisaFeedBack}</h4>
                                </div>
                            }
                        </>                    
                    }

                    {/* view uploaded EAD documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            <p> Below is your submitted EAD. </p>

                            {/* temporary display for testing. Subject to change */}
                            <a href={visaInfo.eadUrl}>EAD Submission</a>
                        </div>
                    }

                    {/* I983 Submission */}
                    {visaInfo.eadStatus === 'Approved' && visaInfo.i983Status === 'Not Started' &&
                        <form id='i983Submit' onSubmit={handleSubmit}>
                            <label htmlFor="i983">Please download and fill out the I-983 form. </label> <br></br>
                            {/* download form  */}
                            <input type="file" name="i983" id="i983" onChange={handleFileChange} required/>
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* I983 related rendering logic */}
                {viewSection.viewI983 && <fieldset className='i983'>
                    <h3 className="statusSummary">Your I-983 status is {visaInfo.i983Status}</h3>
                    {visaInfo.i983Status === 'Pending' && 
                        <p>Form I-983 submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.i983Status === 'Approved' && 
                        <p>Your form I-983 has been approved!</p>
                    }

                    {visaInfo.i983Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrVisaFeedBack &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrVisaFeedBack}</h4>
                                </div>
                            }
                        </>                    
                    }

                    {/* view uploaded I-983 documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            <p> Below is your submitted form I-983. </p>

                            {/* temporary display for testing. Subject to change */}
                            <a href={visaInfo.i983Url}>I-983 Submission</a>
                        </div>
                    }

                    {/* I20 Submission */}
                    {visaInfo.i983Status === 'Approved' && visaInfo.i20Status === 'Not Started' && 
                        <form id='i20Submit' onSubmit={handleSubmit}>
                            <label htmlFor="i20">Please send the I-983 along with all necessary documents to your school 
                                and upload the new I-20.
                            </label> <br></br>
                            <input type="file" name="i20" id="i20" onChange={handleFileChange} required />
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* I20 related rendering logic */}
                {viewSection.viewI20 && <fieldset className='i20'>
                    <h3 className="statusSummary">Your I-20 status is {visaInfo.i20Status}</h3>
                    {visaInfo.i20Status === 'Pending' && 
                        <p>Form I-983 submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.i20Status === 'Approved' && 
                        <p>Your form I-983 has been approved!</p>
                    }

                    {visaInfo.i20Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrVisaFeedBack &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrVisaFeedBack}</h4>
                                </div>
                            }
                        </>                    
                    }

                    {/* view uploaded I-20 documentations */}
                    {
                        <div className="docPreview">
                            {/* documentation preview */}
                            <p> Below is your submitted form I-20. </p>

                            {/* temporary display for testing. Subject to change */}
                            <a href={visaInfo.i20Url}>I-20 Submission</a>
                        </div>
                    }
                </fieldset>}
            </div>
        </>
    )
}

export default VisaStatusEmployees
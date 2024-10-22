import { useState, useEffect } from 'react'
import { token, USER_ENDPOINT, username } from '../constants'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'

const VisaStatusEmployees = () => {
    // only apply to employee OPT visa status
    // get authentication information
    
    const [viewDoc, setViewDoc] = useState({
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
        hrFeedback: ''
    })
    
    const [docs, setDocs] = useState([])
    
    const testGetURL = `${USER_ENDPOINT}/visa`;
    const testPostURL = `${USER_ENDPOINT}/postVisa`;

    useEffect(() => {
        // axios.get(testGetURL, {
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // })

        axios.get(testGetURL) // test

        .then(response => {
            console.log(response) // debug
            const optUrl = response.data.optUrl;
            const eadUrl = response.data.eadUrl;
            const i983Url = response.data.i983Url;
            const i20Url = response.data.i20Url;
            const optStatus = response.data.optStatus;
            const eadStatus = response.data.eadStatus;  
            const i983Status = response.data.i983Status;
            const i20Status = response.data.i20Status;
            const hrFeedback = response.data.hrFeedback;

            setViewDoc({  // update view options
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
                hrFeedback: hrFeedback
            });  
        })
        .catch(error => {
            toast.error(`Error fetching visa info! Error: ${error.message}`)
        })
    }, [])


    // const getDocs = async () => {
    //     const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     })
    //     setDocs(response.data)
    //     console.log('response:', response)
    // }

    const buildFormData = (formData, data, parentKey) => {
        if (data && typeof data === 'object' && !(data instanceof File)) {
            Object.keys(data).forEach(key => {
                buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
            });
        } else {
            formData.append(parentKey, data);
        }
    };

    const createFormData = (data) => {
        const formData = new FormData();
        buildFormData(formData, data);
        formData.append('username', username)
        formData.append('onboardingStatus', 'Pending')
        return formData;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('docs:', docs)  // debug
        const data = createFormData(docs)

        try {
            // await axios.post(testPostURL, data, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //         'Authorization': `Bearer ${token}`,
            //     }
            // })

            // data need to set the corresponding user filed to pending status


            await axios.post(testPostURL, data)  // for testing

            toast.success('Documentation uploaded successfully!')
            // setSubmitted(!submitted)
        }
        catch (error) {
            toast.error(`Error submitting application! Error: ${error.response.data}`)
        }
    }


    return (
        <>
            <h2>Visa Status Page</h2>
            <div>
                {/* employees with non-OPT status or those who got all OPT documentations see the following */}
                {!viewDoc.viewOPT && 
                    <p>This page is for OPT related documentations only. You are all set!</p>
                }

                {/* OPT related rendering logic */}
                {viewDoc.viewOPT && <fieldset className='opt'>
                    {visaInfo.optStatus === 'Pending' && 
                        <p>OPT receipt submitted in onboarding application. Please wait for HR approval.</p>
                    }

                    {visaInfo.optStatus === 'Approved' && 
                        <p>Your OPT receipt has been approved!</p>
                    }

                    {visaInfo.optStatus === 'Rejected' && 
                        <>
                            <p>Your OPT receipt is rejected. Below is your HR's feedback: </p>
                            {visaInfo.hrFeedback &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrFeedback}</h4>
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
                        <form className="ead" onSubmit={handleSubmit}>
                            <label for="eadFront">Please upload photocopies of the front and back of your OPT EAD.</label> <br></br>
                            {/* <input type="file" name="eadFront" id="optReceipt"/>
                            <input type="file" name="eadBack" id="eadBack"/> */}
                            <input type="file" id="ead" name="ead" multiple />
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* EAD related rendering logic */}
                {viewDoc.viewEAD && <fieldset className='ead'>
                    {visaInfo.eadStatus === 'Pending' && 
                        <p>EAD submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.eadStatus === 'Approved' && 
                        <p>Your EAD has been approved!</p>
                    }

                    {visaInfo.eadStatus === 'Rejected' && 
                        <>
                            <p>Your EAD is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrFeedback &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrFeedback}</h4>
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
                        <form onSubmit={handleSubmit}>
                            <label for="i983">Please download and fill out the I-983 form. </label> <br></br>
                            {/* download form  */}
                            <input type="file" name="i983" id="i983"/>
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* I983 related rendering logic */}
                {viewDoc.viewI983 && <fieldset className='i983'>
                    {visaInfo.i983Status === 'Pending' && 
                        <p>Form I-983 submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.i983Status === 'Approved' && 
                        <p>Your form I-983 has been approved!</p>
                    }

                    {visaInfo.i983Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrFeedback &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrFeedback}</h4>
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

                    {/* I983 Submission */}
                    {visaInfo.i983Status === 'Approved' && visaInfo.i20Status === 'Not Started' && 
                        <form onSubmit={handleSubmit}>
                            <label for="i20">Please send the I-983 along with all necessary documents to your school 
                                and upload the new I-20.
                            </label> <br></br>
                            <input type="file" name="i20" id="i20"/>
                            <button type="submit">Submit</button> 
                        </form>
                    }
                </fieldset>}


                {/* I20 related rendering logic */}
                {viewDoc.viewI20 && <fieldset className='i20'>
                    {visaInfo.i20Status === 'Pending' && 
                        <p>Form I-983 submitted. Please wait for HR approval.</p>
                    }

                    {visaInfo.i20Status === 'Approved' && 
                        <p>Your form I-983 has been approved!</p>
                    }

                    {visaInfo.i20Status === 'Rejected' && 
                        <>
                            <p>Your form I-983 is rejected. Below is your HR's feedback</p>
                            {visaInfo.hrFeedback &&
                                <div>
                                    <h3>Feedback from HR:</h3>
                                    <h4>{visaInfo.hrFeedback}</h4>
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
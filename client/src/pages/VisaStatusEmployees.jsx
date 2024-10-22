import React from 'react'
import { token, USER_ENDPOINT, username } from '../constants'
import { ToastContainer, toast } from 'react-toastify'
import axios from 'axios'

const VisaStatusEmployees = () => {
    // only apply to employee OPT visa status
    // get authentication information
    
    const [viewDoc, setViewDoc] = useState(false);
    const [visaInfo, setVisaInfo] = useState({
        optStatus: '',  // OPT receipt status
        eadStatus: '',
        i983Status: '',
        i20Status: '',
        optUrl: '',  // OPT receipt file URL
        eadUrl: '',
        i983Url: '',
        i20Url: '',
    })
    
    const [docs, setDocs] = useState([])
    
    const testGetURL = `${USER_ENDPOINT}/visa`;
    const testPostURL = `${USER_ENDPOINT}/postVisa`;

    
    useEffect(() => {
        axios.get( testGetURL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setUserEmail(response.data.email)
            const optUrl = response.data.optUrl;
            const eadUrl = response.data.eadUrl;
            const i983Url = response.data.i983Url;
            const i20Url = response.data.i20Url;
            const optStatus = response.data.optStatus;
            const eadStatus = response.data.eadStatus;  
            const i983Status = response.data.i983Status;
            const i20Status = response.data.i20Status;

            if (receiptStatus === '') {
                // if user is not of OPT visa status, then they cannot view this page
                setViewDoc(false);
            }

            else if (receiptStatus !== '') {  // user model optStatus change default to not started?
                // can render opt documents
                setViewDoc(true);  // display document
                getDocs()  // fetch documents
                setVisaInfo({  // update visa info state
                    optStatus: optStatus,
                    eadStatus: eadStatus,
                    i983Status: i983Status,
                    i20Status: i20Status,
                    optUrl: optUrl, 
                    eadUrl: eadUrl,
                    i983Url: i983Url,
                    i20Url: i20Url,
                })  
            }

        })
        .catch(error => {
            toast.error(`Error fetching user info! Error: ${error.message}`)
        })
    }, [])


    const getDocs = async () => {
        const response = await axios.get(`${USER_ENDPOINT}/getuserdocs`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        setDocs(response.data)
        console.log('response:', response)
    }

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
        console.log('formData:', formData)  // debug
        const data = createFormData(formData)

        try {
            await axios.post(testPostURL, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            })
            toast.success('Successfully submitted application!')
            setSubmitted(!submitted)
        }
        catch (error) {
            toast.error(`Error submitting application! Error: ${error.response.data}`)
        }
    }


    return (
        <>
            <h2>Visa Status Page</h2>
            <div>
                {!viewDoc && 
                    <P>This page is for OPT related documentations only. You are all set!</P>
                }

                {viewDoc && visaInfo.optStatus === 'Pending' && 
                    <div>
                        <p>OPT receipt submitted in onboarding application. Waiting for HR approval.</p>
                        <p> Below is your submitted OPT receipt. </p>
                    </div>
                }

                {viewDoc && visaInfo.optStatus === 'Approved' && 
                    <form onSubmit={handleSubmit}>
                        <p>Your OPT receipt is approved!</p>
                        <label for="eadFront">Please submit a photocopy of your OPT EAD. </label> <br></br>
                        <input type="file" name="eadFront" id="optReceipt"/>
                        <input type="file" name="eadBack" id="eadBack"/>
                        <button type="submit">Submit</button> 
                    </form>
                }

                {viewDoc && visaInfo.optStatus === 'Approved' && visaInfo.eadStatus === 'Approved' && 
                    <form onSubmit={handleSubmit}>
                        <p>Your EAD documentation is approved!</p>
                        <label for="i983">Please download and fill out the I-983 form. </label> <br></br>
                        {/* download form  */}
                        <input type="file" name="i983" id="i983"/>
                        <button type="submit">Submit</button> 
                    </form>
                }

                {viewDoc && visaInfo.optStatus === 'Approved' && visaInfo.eadStatus === 'Approved' && 
                visaInfo.i983Status === 'Approved' &&
                    <form onSubmit={handleSubmit}>
                        <p>Your I-983 form is approved!</p>
                        <label for="i20">Please send the I-983 along with all necessary documents to your school 
                        and upload the new I-20.</label> <br></br>
                        <input type="file" name="i20" id="i20" />   
                        {/* disabled={visaInfo.i20Status === 'Pending'}  */}
                        <button type="submit">Submit</button> 
                    </form>
                }                
                
            </div>
        </>
    )
}

export default VisaStatusEmployees
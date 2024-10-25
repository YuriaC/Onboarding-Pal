import {useState} from 'react'
import VisaStatusHR_inprogress from '../components/VisaStatusHR_Inprogress';
import VisaStatusHR_all from '../components/VisaStatusHR_all';
import { Button} from '@mui/material'

const VisaStatusHR = () => {
    const [visibleDiv, setVisibleDiv] = useState('inprogress'); // State to track visible div

    const handleToggle = (div) => {
        setVisibleDiv(prevDiv => (prevDiv === div ? null : div)); // Toggle visibility
    };
        

    return (
        <div style={{ minWidth: '1200px' }}>
            <Button onClick={() => handleToggle('all')}>
                {visibleDiv === 'all' ? 'Hide' : 'Show'} All
            </Button>
            <Button onClick={() => handleToggle('inprogress')}>
                {visibleDiv === 'inprogress' ? 'Hide' : 'Show'} In Progress
            </Button>

            {/* Conditionally render Div 1 */}
            {visibleDiv === 'all' && (
                <div>
                    <p>All Employees</p>
                    <VisaStatusHR_all/>
                </div>
            )}

            {/* Conditionally render Div 2 */}
            {visibleDiv === 'inprogress' && (
                <div>
                    <p>In progress Employees</p>
                    <VisaStatusHR_inprogress/>
                </div>
            )}
        </div>
    )
}

export default VisaStatusHR
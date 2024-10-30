import {useState} from 'react'
import VisaStatusHR_inprogress from '../components/VisaStatusHR_Inprogress';
import VisaStatusHR_all from '../components/VisaStatusHR_all';
import { Container , Box, Typography, Button } from '@mui/material'

const VisaStatusHR = () => {
    const [visibleDiv, setVisibleDiv] = useState('inprogress'); // State to track visible div

    const handleToggle = (div) => {
        setVisibleDiv(prevDiv => (prevDiv === div ? null : div)); // Toggle visibility
    };
        

    return (
        <Container sx={{padding: "2rem", width: '75vw', minWidth: "60vw"}}>
            <Button onClick={() => handleToggle('all')}>
                {visibleDiv === 'all' ? 'Hide' : 'Show'} All
            </Button>
            <Button onClick={() => handleToggle('inprogress')}>
                {visibleDiv === 'inprogress' ? 'Hide' : 'Show'} In Progress
            </Button>

            {/* Conditionally render Div 1 */}
            {visibleDiv === 'all' && (
                <div>
                    <Typography variant="h6">All Employees</Typography>
                    <VisaStatusHR_all/>
                </div>
            )}

            {/* Conditionally render Div 2 */}
            {visibleDiv === 'inprogress' && (
                <div>
                    <Typography variant="h6" sx={{marginLeft: '.5rem'}}>In progress Employees</Typography>
                    <VisaStatusHR_inprogress/>
                </div>
            )}
        </Container>
    )
}

export default VisaStatusHR
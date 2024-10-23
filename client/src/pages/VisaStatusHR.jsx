import {useState} from 'react'
import VisaStatusHR_inprogress from './VisaStatusHR_Inprogress';
import VisaStatusHR_all from './VisaStatusHR_all';

const VisaStatusHR = () => {
    const [visibleDiv, setVisibleDiv] = useState('inprogress'); // State to track visible div

    const handleToggle = (div) => {
        setVisibleDiv(prevDiv => (prevDiv === div ? null : div)); // Toggle visibility
    };
        

    return (
        <div>
            <button onClick={() => handleToggle('all')}>
                {visibleDiv === 'all' ? 'Hide' : 'Show'} All
            </button>
            <button onClick={() => handleToggle('inprogress')}>
                {visibleDiv === 'inprogress' ? 'Hide' : 'Show'} In Progress
            </button>

            {/* Conditionally render Div 1 */}
            {visibleDiv === 'all' && (
                <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
                <p>All Employees</p>
                <VisaStatusHR_all/>
                </div>
            )}

            {/* Conditionally render Div 2 */}
            {visibleDiv === 'inprogress' && (
                <div style={{ marginTop: '10px', border: '1px solid #ccc', padding: '10px' }}>
                <p>In progress Employees!</p>
                <VisaStatusHR_inprogress/>
                </div>
            )}
    </div>
    )
}

export default VisaStatusHR
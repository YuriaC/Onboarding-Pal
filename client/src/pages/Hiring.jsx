import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tabs, Tab, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { sendRegistrationLinkThunk, fetchRegistrationHistoryThunk, fetchApplicationsThunk } from '../store/user/userSlice';
import { useNavigate } from 'react-router-dom';

const Hiring = () => {

    const navigate = useNavigate()

    const [selectedTab, setSelectedTab] = useState(0);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const dispatch = useDispatch();
    const { registrationHistory, pendingApplications, approvedApplications, rejectedApplications } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(fetchRegistrationHistoryThunk());
        dispatch(fetchApplicationsThunk()); // Fetch onboarding applications when component loads
    }, [dispatch]);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleSendRegistration = () => {
        // Dispatch the action to send the registration link
        dispatch(sendRegistrationLinkThunk({ email, name }))
            .unwrap()
            .then(() => {
                // Fetch the updated registration history only after successfully sending
                dispatch(fetchRegistrationHistoryThunk());
            });
        setEmail(''); // Clear the input after sending
        setName(''); // Clear the name input after sending
    };

    const handleResendRegistration = (entry) => {
        dispatch(sendRegistrationLinkThunk({ email: entry.email, name: `${entry.firstName} ${entry.lastName}` }))
            .unwrap()
            .then(() => {
                dispatch(fetchRegistrationHistoryThunk());
            });
    };

    const handleViewApplication = (employeeId) => {
        // Logic to open the application in a new tab
        window.open(`/hr/application/${employeeId}`, '_blank');
        navigate(`/hr/application/${employeeId}`)
    };

    return (
        <Box>
            <Tabs value={selectedTab} onChange={handleTabChange} centered>
                <Tab label="Registration Token" />
                <Tab label="Onboarding Application Review" />
            </Tabs>

            {selectedTab === 0 && (
                <Box sx={{ padding: 3 }}>
                    <Typography variant="h6">Send Registration Link</Typography>
                    <TextField
                        label="Full Name"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Email Address"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendRegistration}
                    >
                        Send Registration Link
                    </Button>

                    <Box sx={{ marginTop: 4 }}>
                        <Typography variant="h6">Registration History</Typography>
                        <List>
                             {registrationHistory.map((entry) => (
                                <ListItem key={entry.email}>
                                    <ListItemText
                                        primary={`Name: ${entry.firstName} ${entry.lastName} | Email: ${entry.email}`}
                                        secondary={`Registration Status: ${entry.registrationHistory.status }`}
                                    />
                                    <Button onClick={() => handleResendRegistration(entry)}>Resend Link</Button>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}

            {selectedTab === 1 && (
                <Box sx={{ padding: 3 }}>

                    {/* Pending Applications */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Pending Applications</Typography>
                    {pendingApplications.length === 0 ? (
                        <Typography>No pending applications</Typography>
                    ) : (
                        <List>
                            {pendingApplications.map(application => {
                                return (
                                <ListItem key={application._id}>
                                    <ListItemText
                                        primary={`Name: ${application.firstName} ${application.lastName} | Email: ${application.email}`}
                                    />
                                    <Button onClick={() => handleViewApplication(application._id)}>
                                        View Application
                                    </Button>
                                </ListItem>
                            )})}
                        </List>
                    )}

                    {/* Rejected Applications */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Rejected Applications</Typography>
                    {rejectedApplications.length === 0 ? (
                        <Typography>No rejected applications</Typography>
                    ) : (
                        <List>
                            {rejectedApplications.map(application => {
                                return (
                                <ListItem key={application._id}>
                                    <ListItemText
                                        primary={`Name: ${application.firstName} ${application.lastName} | Email: ${application.email}`}
                                    />
                                    <Button onClick={() => handleViewApplication(application._id)}>
                                        View Application
                                    </Button>
                                </ListItem>
                            )})}
                        </List>
                    )}

                    {/* Approved Applications */}
                    <Typography variant="h6" sx={{ marginTop: 2 }}>Approved Applications</Typography>
                    {approvedApplications.length === 0 ? (
                        <Typography>No approved applications</Typography>
                    ) : (
                        <List>
                            {approvedApplications.map(application => (
                                <ListItem key={application.id}>
                                    <ListItemText
                                        primary={`Name: ${application.firstName} ${application.lastName} | Email: ${application.email}`}
                                    />
                                    <Button onClick={() => handleViewApplication(application._id)}>
                                        View Application
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default Hiring;

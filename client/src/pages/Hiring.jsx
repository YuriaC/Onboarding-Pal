import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {TableContainer,TableHead, Table, TableBody, TableRow, TableCell, Box, Tabs, Tab, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { sendRegistrationLinkThunk, fetchRegistrationHistoryThunk, fetchApplicationsThunk } from '../store/user/userSlice';
import { toast, ToastContainer } from 'react-toastify';

const Hiring = () => {

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
                toast.success('Successfully sent registration token!')
                dispatch(fetchRegistrationHistoryThunk());
            })
            .catch(error => {
                toast.error(`Error sending registration token! Error: ${error.message}`)
            })
        setEmail(''); // Clear the input after sending
        setName(''); // Clear the name input after sending
    };

    const handleResendRegistration = (entry) => {
        dispatch(sendRegistrationLinkThunk({ email: entry.email, name: `${entry.firstName} ${entry.lastName}` }))
            .unwrap()
            .then(() => {
                toast.success('Successfully resent registration token!')
                dispatch(fetchRegistrationHistoryThunk());
            })
            .catch(error => {
                toast.error(`Error resending registration token! Error: ${error.message}`)
            })
    };

    const handleViewApplication = (employeeId) => {
        // Logic to open the application in a new tab
        window.open(`/hr/application/${employeeId}`, '_blank');

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
                        Generate token and send email
                    </Button>

                    <Box sx={{ marginTop: 4 }}>
                        <Typography variant="h6">Registration History</Typography>
                        <TableContainer >
                            <Table sx={{ minWidth: 650, textAlign: 'center' }} aria-label="simple table">
                                <TableHead>
                                    <TableRow sx= {{ textAlign: 'center'  , '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>Full Name</TableCell>
                                        <TableCell align="center">Email</TableCell>
                                        <TableCell align="center">Registration Status</TableCell>
                                        <TableCell align="center">Link</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody >
                                    {registrationHistory.map((entry) => (
                                        <TableRow
                                            key={entry.email}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {`${entry.firstName} ${entry.lastName}`}
                                            </TableCell>
                                            <TableCell align="right">{entry.email}</TableCell>
                                            <TableCell align="right">{entry.registrationHistory.status}</TableCell>
                                            <TableCell align="right" sx ={{ cursor: 'pointer', color    : 'blue' }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(entry.registrationHistory.link);
                                                        toast.success('Link copied to clipboard!');
                                                    }}
                                                >
                                                    Copy Link
                                                </Button>
                                            </TableCell>
                                            <TableCell align="right">
                                                {entry.registrationHistory.status === 'Pending' ? <Button onClick={() => handleResendRegistration(entry)}>Resend Link</Button> : 'None'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
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
                                <ListItem key={application._id}>
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
            <ToastContainer />
        </Box>
    );
};

export default Hiring;

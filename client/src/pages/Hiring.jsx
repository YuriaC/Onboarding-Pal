import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tabs, Tab, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { sendRegistrationLinkThunk, fetchRegistrationHistoryThunk } from '../store/user/userSlice';

const Hiring = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { registrationHistory } = useSelector(state => state.user);

    // Memoize the dispatch function to avoid re-creating it
    const fetchHistory = useCallback(() => {
        dispatch(fetchRegistrationHistoryThunk());
    }, [dispatch]);

    // Fetch the registration history only once on component load
    useEffect(() => {
        fetchHistory();
    }, [email]);
    
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleSendRegistration = () => {
        // Dispatch the action to send the registration link
        dispatch(sendRegistrationLinkThunk(email));
        setEmail(''); // Clear the input after sending
    };

    return (
        <Box>
            <Tabs value={selectedTab} onChange={handleTabChange} centered>
                <Tab label="Registration Token" />
                <Tab label="Onboarding Application" />
            </Tabs>

            {selectedTab === 0 && (
                <Box sx={{ padding: 3 }}>
                    <Typography variant="h6">Send Registration Link</Typography>
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
                                        primary={`Email: ${entry.email} | Name: ${entry.name}`}
                                        secondary={`Link: ${entry.link} | Status: ${entry.status ? 'Registered' : 'Pending'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>
            )}

            {selectedTab === 1 && (
                <Box sx={{ padding: 3 }}>
                    <Typography variant="h6">Onboarding Application</Typography>
                    <Typography variant="body1">This section will handle onboarding applications.</Typography>
                </Box>
            )}
        </Box>
    );
};

export default Hiring;

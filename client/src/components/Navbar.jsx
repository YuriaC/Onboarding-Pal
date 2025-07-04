import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    Button,
    Stack,
} from "@mui/material";
import { logoutUserThunk } from "../store/user/userSlice";
import { getUserRoleFromCookie } from "../helpers/HelperFunctions";

const Navbar = () => {
    const { userRole, status } = getUserRoleFromCookie();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
        // Remove the token from the cookie

        document.cookie = "";
        // setTimeout(() => {
        //     console.log('Logged out')
        // }, 500)
        navigate("/login"); // Redirect to login page after logout
        dispatch(logoutUserThunk()); // Dispatch the logout action
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* AppBar fixed at the top */}
            <AppBar position="fixed">
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Left div for title */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6">BeaconFire Portal</Typography>
                    </Box>

                    {/* Center div for navigation links */}
                    <Box sx={{ display: "flex", justifyContent: "center", flexGrow: 1 }}>
                        <Stack direction="row" spacing={2}>
                            {userRole === "employee" && (
                                <>
                                    {status !== "Approved" && (
                                        <>
                                            <NavLink
                                                to="/employee/onboarding"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : "nav-link"
                                                }
                                            >
                                                Onboarding
                                            </NavLink>
                                            <NavLink
                                                to="/employee/visa-status"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : "nav-link"
                                                }
                                            >
                                                Visa Status
                                            </NavLink>
                                        </>
                                    )}
                                    {status == "Approved" ? (
                                        <>
                                            <NavLink
                                                to="/employee/profile"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : "nav-link"
                                                }
                                            >
                                                Personal
                                            </NavLink>
                                            <NavLink
                                                to="/employee/visa-status"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : "nav-link"
                                                }
                                            >
                                                Visa Status
                                            </NavLink>
                                            <NavLink
                                                to="/employee/housing"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : "nav-link"
                                                }
                                            >
                                                Housing
                                            </NavLink>
                                        </>
                                    ) : null}
                                </>
                            )}
                            {userRole === "hr" && (
                                <>
                                    <NavLink
                                        to="/hr/home"
                                        className={({ isActive }) =>
                                            isActive ? "active-link" : "nav-link"
                                        }
                                    >
                                        Home/Employee Profiles
                                    </NavLink>
                                    <NavLink
                                        to="/hr/visa-status"
                                        className={({ isActive }) =>
                                            isActive ? "active-link" : "nav-link"
                                        }
                                    >
                                        Visa Status
                                    </NavLink>
                                    <NavLink
                                        to="/hr/hiring"
                                        className={({ isActive }) =>
                                            isActive ? "active-link" : "nav-link"
                                        }
                                    >
                                        Hiring Management
                                    </NavLink>
                                    <NavLink
                                        to="/hr/housing-management"
                                        className={({ isActive }) =>
                                            isActive ? "active-link" : "nav-link"
                                        }
                                    >
                                        Housing Management
                                    </NavLink>
                                </>
                            )}
                        </Stack>
                    </Box>
                    {/* Right div for Logout button */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            color="inherit"
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Container to ensure content starts below the navbar */}
            <Container sx={{ mt: 10 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

export default Navbar;

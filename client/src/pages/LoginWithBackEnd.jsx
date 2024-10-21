import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
import { USER_ENDPOINT } from '../constants'

const Test = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        credential: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({
        credential: '',
        password: ''
    });

    // const validatorForm = () => {
    //     let errors = {};

    //     if(!validator.isEmail(form.credential) && !validator.isLength(form.credential, { min: 3, max: 15 })){
    //         errors.credential = 'Username must be between 3 and 15 characters';
    //     }

    //     if (!validator.isStrongPassword(form.password, {
    //         minLength: 8,
    //         minLowercase: 1,
    //         minUppercase: 1,
    //         minNumbers: 1,
    //         minSymbols: 1
    //     })) {
    //         errors.password = 'Password must be at least 8 characters long, and include at least 1 lowercase letter,\n 1 uppercase letter, 1 number, and 1 symbol.';
    //     }

    //     setFormErrors(errors);

    //     return Object.keys(errors).length === 0;
    // }

    // // connect to backend
    const loginEndPoint = USER_ENDPOINT + '/login'
    const userLogin = (e) => {
        e.preventDefault();

            axios.post(loginEndPoint, {form})
                .then(response => {
                    // console.log(response, response.data);  // debug
                    localStorage.setItem('token', JSON.stringify(response.data.data));
                })
                .catch(err => {
                    if (err.response) {
                        const errors = {}
                        const errorMessage = err.response.data.message || 'An error occurred. Please try again.';
                        console.error(errorMessage);
                        if (err.response.status === 404) {
                            errors.credential = errorMessage;
                        } else {
                            errors.password = errorMessage;
                        } 
                        setFormErrors(errors);
                    } else {
                        // Network or other errors
                        console.error('Network error or server is not reachable.');
                        alert('Network error or server is not reachable.');
                    }
                });
    
    }


    // first useEffect for delayed display effect
    useEffect(() => {
        setTimeout(() => setIsVisible(true), 300);
    }, []);
    

    return (
        <div className={`register-form ${isVisible ? 'visible' : ''}`}>
            <form>
                <div className="form-group">
                    <label htmlFor='credential'>Username or Email: <span className="required">*</span></label>
                    <input type="text" required name="credential" id="credential" placeholder="your username or Email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, credential: e.target.value }) }}
                    />
                    {formErrors.credential && <p className="error">{formErrors.credential}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor='password'>Password: <span className="required">*</span></label>
                    <input type="password" required name="password" id="password" placeholder="Password"
                        value={form.password}
                        onChange={(e) => { setForm({ ...form, password: e.target.value }) }}
                    />
                    {formErrors.password && <p className="error">
                        {formErrors.password.slice(0, formErrors.password.length / 2)}    
                        <br />
                        {formErrors.password.slice(formErrors.password.length / 2)}
                    </p>}
                </div>

                <div className='registerButtonAndLink'>
                    <button type="submit" onClick={userLogin}>Login</button>
                    <div>Don't have an account? <NavLink to="/auth/registration" className='signButton'>Sign up</NavLink></div>
                </div>
            </form>
        </div>
    );
}

export default Test;

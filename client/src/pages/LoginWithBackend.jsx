import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const Login = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        userInput: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({
        userInput: '',
        password: ''
    });

    const validatorForm = () => {
        let errors = {};

        if(!validator.isEmail(form.userInput) && !validator.isLength(form.userInput, { min: 3, max: 15 })){
            errors.userInput = 'Username must be between 3 and 15 characters';
        }

        if (!validator.isStrongPassword(form.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            errors.password = 'Password must be at least 8 characters long, and include at least 1 lowercase letter,\n 1 uppercase letter, 1 number, and 1 symbol.';
        }


        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    const userLogin = (e) => {
        e.preventDefault();

        if (validatorForm()) {
            //axios fetch
            localStorage.setItem('token', 'token');//fake authorication
            navigate('/');
        }
    }

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 300);
    }, []);

    return (
        <div className={`register-form ${isVisible ? 'visible' : ''}`}>
            <form>
                <div className="form-group">
                    <label htmlFor='userInput'>Username or Email: <span className="required">*</span></label>
                    <input type="text" required name="userInput" placeholder="your username or Email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, userInput: e.target.value }) }}
                    />
                    {formErrors.userInput && <p className="error">{formErrors.userInput}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor='password'>Password: <span className="required">*</span></label>
                    <input type="password" required name="password" placeholder="Password"
                        value={form.password}
                        onChange={(e) => { setForm({ ...form, password: e.target.value }) }}
                    />
                    {formErrors.password && <p className="error">
                        {formErrors.password.slice(0, formErrors.password.length / 2)}    <br />
                        {formErrors.password.slice(formErrors.password.length / 2)}

                    </p>}
                </div>


                <div className='registerButtonAndLink'>
                    <button type="submit" onClick={userLogin}>Login</button>
                    <div>Don’t have an account? <NavLink to="/auth/registration" className='signButton'>Sign up</NavLink></div>
                </div>
            </form>
        </div>
    );
}

export default Login;

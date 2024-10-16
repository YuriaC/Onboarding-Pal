import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import './auth.css';

const Registration = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });

    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });

    const validatorForm = () => {
        let errors = {};

        if (!validator.isLength(form.username, { min: 3, max: 15 })) {
            errors.username = 'Username must be between 3 and 15 characters';
        }

        if (!validator.isEmail(form.email)) {
            errors.email = 'Please enter a valid email';
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

        if (form.password !== form.repeatPassword) {
            errors.repeatPassword = 'Passwords do not match';
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    const userRegister = (e) => {
        e.preventDefault();

        if (validatorForm()) {
            //axios fetch
            navigate('/auth/login')
        }
    }

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 300);
    }, []);

    return (
        <div className={`register-form ${isVisible ? 'visible' : ''}`}>
            <form>
                <div className="form-group">
                    <label htmlFor='username'>Username: <span className="required">*</span></label>
                    <input type="text" required name="username" placeholder="Your username"
                        value={form.username}
                        onChange={(e) => { setForm({ ...form, username: e.target.value }) }}
                    />
                    {formErrors.username && <p className="error">{formErrors.username}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor='email'>Email: <span className="required">*</span></label>
                    <input type="email" required name="email" placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                    />
                    {formErrors.email && <p className="error">{formErrors.email}</p>}
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

                <div className="form-group">
                    <label htmlFor='repeatPassword'>Repeat Password: <span className="required">*</span></label>
                    <input type="password" requiredname="repeatPassword" placeholder="Repeat password"
                        value={form.repeatPassword}
                        onChange={(e) => { setForm({ ...form, repeatPassword: e.target.value }) }}
                    />
                    {formErrors.repeatPassword && <p className="error">{formErrors.repeatPassword}</p>}
                </div>

                <div className='registerButtonAndLink'>
                    <button type="submit" onClick={userRegister}>Register</button>
                    <div>Already have an account? <NavLink to="/auth/login">Sign in</NavLink></div>
                </div>
            </form>
        </div>
    );
}

export default Registration;

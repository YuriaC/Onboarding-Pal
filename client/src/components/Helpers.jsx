import React from 'react'

const PhoneInput = (props) => {

    return (
        <input type='number' onChange={props.handleChange} name={props.name} min={1000000000} max={9999999999} required={props.required} />
    )
}

export default PhoneInput
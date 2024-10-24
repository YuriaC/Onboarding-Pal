
/**
 * Returns a new object with string properties set to '' and number properties set to 0
 * 
 * @param {Object} obj - The object to be reset
 * @returns {Object} A new object with string properties set to '' and number properties set to 0
 */

export const resetObject = (obj) => {

    const ret = {}

    for (let key in obj) {
        if (typeof obj[key] === 'number') {
            ret[key] = undefined
        }
        else if (typeof obj[key] === 'string') {
            ret[key] = ''
        }
        // ret[key] = null
    }

    return ret
}

// helpers.js
export const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

// Extract the role from the token (assuming the role is stored in a JWT or the cookie itself)
export const getUserRoleFromCookie = () => {
    const token = getCookieValue('auth_token');
    
    if (!token) {
        return null;
    }

    try {
        // Decode the token to get user information (if it's a JWT, use a library like jwt-decode)
        // Assume the token contains a "role" field
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload (example)
        return payload.role;
    } catch (error) {
        console.error("Error decoding token", error);
        return null;
    }
};

export const isNumeric = (str) => {
    return !isNaN(str) && !isNaN(parseFloat(str))
}

export const checkZIP = (str) => {
    return str.length === 5 && isNumeric(str)
}

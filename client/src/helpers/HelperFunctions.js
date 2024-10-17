
/**
 * Returns a new object with string properties set to '' and number properties set to 0
 * 
 * @param {Object} obj - The object to be reset
 * @returns {Object} A new object with string properties set to '' and number properties set to 0
 */
const resetObject = (obj) => {

    const ret = {}

    for (let key in obj) {
        if (typeof obj[key] === 'number') {
            ret[key] = 0
        }
        else if (typeof obj[key] === 'string') {
            ret[key] = ''
        }
    }

    return ret
}

export default resetObject

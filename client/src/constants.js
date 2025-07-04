// const port = 5500;

const PORT = 3000;  // need to find better way to set port value dynamically

export const BACKEND_BASEURL = `http://localhost:${PORT}`
export const API_BASE_URL = `http://localhost:${PORT}/api`
export const USER_ENDPOINT = `${API_BASE_URL}/users`
export const HOUSE_ENDPOINT = `${API_BASE_URL}/houses`
export const CONTACT_ENDPOINT = `${API_BASE_URL}/contacts`
export const REPORT_ENDPOINT = `${API_BASE_URL}/reports`
export const COMMENT_ENDPOINT = `${API_BASE_URL}/comments`

export const phoneRegex = /^(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const alphanumRegex = /^[a-z0-9]+$/i

export const TEST_ENDPOINT = `${API_BASE_URL}/tests`  // for unit test

// HR
// export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJ1c2VybmFtZSI6IkhSVGVzdCIsInJvbGUiOiJociIsImlhdCI6MTcyOTMyODAxNywiZXhwIjoxNzI5MzM4ODE3fQ.ExQNnb25DDX2Wd_dVHxzdmDafdb2VgW1PIegqKavFK4'
// Employee
export const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJ1c2VybmFtZSI6IkVtcGxveWVlVGVzdCIsInJvbGUiOiJlbXBsb3llZSIsImlhdCI6MTcyOTQ4MTI3NCwiZXhwIjoxNzI5NDkyMDc0fQ.b6gjXYBK6zrrEXHcxvpuq-6nocWnO5EdERlTC1mg1IQ'

export const username = 'EmployeeTest'

export const docStatuses = ['optStatus', 'eadStatus', 'i983Status', 'i20Status']
export const docUrls = ['optUrl', 'eadUrl', 'i983Url', 'i20Url']
export const docNames = ['OPT', 'OPT EAD', 'I-983', 'I-20']

import { FormHelperText } from '@mui/material'

const ErrorHelperText = (props) => {

    return (
        <div>
            {props.hasError && (
                <FormHelperText sx={{ color: 'red', margin: 0, mb: 2, pl: 1, mt: -1, fontWeight: 'bold' }}>
                    {props.message}
                </FormHelperText>
            )}
        </div>
    )
}

export default ErrorHelperText
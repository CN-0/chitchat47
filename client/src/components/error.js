import React from 'react'

const Error = props =>{
    return(
    <div className="error from-top">
        {props.error}
    </div>)
}

export default Error
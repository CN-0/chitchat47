import React from "react";
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';

const Register = props =>{
    const submitted = e => {
        e.preventDefault()
          props.tryregister({
            email:e.target.email.value,
            username:e.target.username.value,
            password:e.target.password.value,
            cpassword:e.target.cpassword.value
        })
    };
    if (props.isAuthenticated) {
    return <Redirect to='/home' />
    }
    return(
        <div className="auth">
            <div className="landing-text">
                Let's have some Chit Chat 
            </div>
            <div className="form">
                <h2 className="heading-secondary">
                    Register
                </h2>
                <form className="form__group" onSubmit={submitted}>
                    <input type="email" className="form__input" placeholder="Email address" id="email" required />
                    <input type="text" className="form__input" placeholder="Username (max-length:10)" id="username" required />
                    <input type="password" className="form__input" placeholder="Password (min-length:6)" id="password" required />
                    <input type="password" className="form__input" placeholder="Confirm Password" id="cpassword" required />
                    <button className="btn btn--green u-margin-top-medium u-margin-bottom-medium">Register</button>
                </form>
            </div>
        </div>
    )
}


const mapStateToProps = state => {
    return {
      isAuthenticated: state.auth.token !== null
    };
};
  
const mapDispatchToProps = dispatch => {
return {
    authfailed:(err) => dispatch(actions.authFail(err)),
    tryregister: (registerData) => dispatch(actions.register(registerData))
};
};

export default connect(mapStateToProps, mapDispatchToProps)(Register)

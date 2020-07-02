import React from "react";
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';


const Login = props =>{
    const submitted = e => {
        e.preventDefault()
        props.trylogin({
          email:e.target.email.value,
          password:e.target.password.value
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
                    Login
                </h2>
                <form className="form__group" onSubmit={submitted}>
                    <input type="email" className="form__input" placeholder="Email address" id="email" required />
                    <input type="password" className="form__input" placeholder="Password" id="password" required />
                    <button className="btn btn--green u-margin-top-medium u-margin-bottom-medium">Login</button>
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
    trylogin: (loginData) => dispatch(actions.login(loginData))
};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login)
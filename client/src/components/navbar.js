import React from 'react'
import {Link} from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../store/actions/index';

const Navbar = props =>{
    const logout = () =>{
        props.trylogout()
    }

    const changeStatus = ()=>{
        props.setsidebarstatus(!props.presentStatus)
    }

    let content=(
        <div>
            <div className="login">
                <Link to="/login">login</Link>
            </div>
            <div className="register">
                <Link to="/register">register</Link>
            </div>

        </div>
    )
    if(props.isAuthenticated){
        content=(
            <div>
                <div className="logout">
                    <a href="#">Profile</a>
                </div>
                <div className="logout">
                    <a onClick={logout} href="#">Logout</a>
                </div>
            </div>
        )
    }

    return(
    <div className="nav">
        <div>
        <div onClick={changeStatus} className="menu-box">
        <span className="menu-bar">
              &nbsp;
        </span>
        </div>
        <div className="Logo">
            <Link to="/">Chit Chat</Link>
        </div>
        </div>
        {content}
    </div>
    )
};
const mapStateToProps = state => {
    return {
      isAuthenticated: state.auth.token !== null,
      presentStatus : state.auth.sidebarStatus
    };
}
const mapDispatchToProps = dispatch => {
    return {
        trylogout: ()=>dispatch(actions.logout()),
        setsidebarstatus : (statusData) => dispatch(actions.sidebarStatus(statusData))
    };
};
  
export default connect(mapStateToProps,mapDispatchToProps)(Navbar)
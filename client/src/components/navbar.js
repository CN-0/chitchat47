import React,{useState} from 'react'
import {Link} from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from '../store/actions/index';

const Navbar = props =>{
    const [popup,setPopup] = useState(false);
    const logout = () =>{
        props.trylogout()
    }

    const changeStatus = ()=>{
        props.setsidebarstatus(!props.presentStatus)
    }
    const avatar = e =>{
        console.log(e.target.files[0].name)
        console.log("haven't added the feature yet!!")
        e.target.value=null
    }
    const openPopup = ()=>{
        setPopup(true)
    }
    const closed= () =>{
        setPopup(false)
    }
    const submitted = e =>{
        e.preventDefault()
        setPopup(false)
        props.updatepassword(e.target.password.value)
    }
    const popupContent =( 
        <form onSubmit={submitted} className="popup" id="popup">
            <div className="popupbox">
                <div className="popupbox__top" >
                    <h2 className="heading-tertiary">Enter new Password</h2>
                </div>
                <div className="popupbox__content">
                <input style={{color:"black"}} type="text" className="form__input" id="password" placeholder="New Password (min-length:6)" />
                </div>
                <div className="popupbox__bottom" >
                    <button onClick={closed} href="#" >Cancel</button>
                    <button type="submit" href="#">Change</button>
                </div>
            </div>
        </form>)

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
                <div className="dropdown">
                    <div className="logout dropdown-btn">Profile</div>
                    <div className="dropdown-content">
                        <label className="dropdown-content-btn">avatar
                        <input onChange={avatar} id="avatar" style={{display:"none"}} type="file" accept="image/*" />
                        </label>
                    
                    <div onClick={openPopup} className="dropdown-content-btn u-margin-bottom-verysmall" >password</div>
                    </div>
                </div>
                <div className="logout">
                    <a onClick={logout} href="#">Logout</a>
                </div>
                {popup?popupContent:null}
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
      mytoken: state.auth.token,
      isAuthenticated: state.auth.token !== null,
      presentStatus : state.auth.sidebarStatus
    };
}
const mapDispatchToProps = dispatch => {
    return {
        trylogout: ()=>dispatch(actions.logout()),
        updatepassword: (password)=>dispatch(actions.updatePassword(password)),
        setsidebarstatus : (statusData) => dispatch(actions.sidebarStatus(statusData))
    };
};
  
export default connect(mapStateToProps,mapDispatchToProps)(Navbar)
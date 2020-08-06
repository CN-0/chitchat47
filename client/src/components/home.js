import React,{useState,useEffect,useRef} from 'react'
import io from "socket.io-client";
import image2 from '../images/realtor-2.jpg'
import Chat from "./chat";
import * as actions from '../store/actions/index';
import { connect } from 'react-redux';
import applyTheme from './theme'

const Home = props =>{
    const [currentTheme, setTheme] = React.useState("light");
    const [checked,setChecked] = useState(false);
    const [popup,setPopup] = useState(false);
    const [openChat,setOpenChat] = useState({});
    const [activeIndex,setActiveIndex] = useState("");
    /*const { current: socket } = useRef(io.connect(window.location.hostname,{
        query: `token=${props.mytoken}`
    }))*/
    const { current: socket } = useRef(io.connect("http://localhost:5000",{
        query: `token=${props.mytoken}`
    }))

    useEffect(()=>{
        let friends=[]
        props.myfriends.forEach(friend=>{
            friends.push(friend.chat)
        })
        socket.emit("addSocket",friends)
        socket.on("messagePosted",data=>{
            props.postmessages(data)
           
        })
        return () => {
            socket.disconnect()
        }
        // eslint-disable-next-line
    },[])

    const newChatMessage = data =>{
        socket.emit("inputChatMessage",data)
    }

    const openPopup = () =>{
        setPopup(true)
    }
    const closed= () =>{
        setPopup(false)
    }
    const submitted = e =>{
        e.preventDefault()
        let friend = e.target.email.value
        props.postfriend(friend)
        setPopup(false)
    }

    const chatClicked = (index, activeFriend) =>{
        props.getmessages(activeFriend.chat)
        setOpenChat(activeFriend)
        props.removemessages(activeFriend.chat)
        props.setsidebarstatus(false)
        setActiveIndex(index)
        
    }
    const onCheckboxChange = e =>{
        let value = e.target.value==="true"?true:false
        setChecked(!value)
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        applyTheme(nextTheme);
    }
    const popupContent =( 
    <form onSubmit={submitted} className="popup" id="popup">
        <div className="popupbox">
            <div className="popupbox__top" >
                <h2 className="heading-tertiary">Enter Your Friends Email</h2>
            </div>
            <div className="popupbox__content" >
            <input type="email" className="form__input" id="email" placeholder="Enter your friends Email" />
            </div>
            <div className="popupbox__bottom" >
                <button onClick={closed} href="#" >Cancel</button>
                <button type="submit" href="#">Add</button>
            </div>
        </div>
    </form>)
    return(<>
        <div className="home">
            <div className={props.mysidebarstatus?"sidebar":"sidebar sidebar-close"}>
                <div className="button-box">
                    <div className="sidebar__button">
                    <button onClick={openPopup} className="btn--green">Add a Friend</button>
                    </div>
                    <div>
                        <label className="switch">
                            <input type="checkbox" value={checked} onChange={ onCheckboxChange } />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
                {props.myfriends?props.myfriends.map((friend,index)=>{
                    let className = activeIndex === index ? 'activeElement' : 'sidebar__chat';
                    return(
                        <div key={index} onClick={()=>chatClicked(index,friend)} className={className}>
                            {friend.friendAvatar?<img className="imgg" src={`data:image/${friend.friendAvatar.img.contentType} ;base64,${friend.friendAvatar.img.data}`} alt="2" />:< img src={image2} className="imgg" alt="pp" />}
                            <h3 className="heading-3">
                                {friend.friendUsername}
                            </h3>
                            {props.mynewmessages[friend.chat]>0?<div className="new-messages">{props.mynewmessages[friend.chat]}</div>:null}
                        </div>
                    )
                }):null}
            </div>
            <div className={props.mysidebarstatus?"chat-page-main":"chat-page-main chat-page-main-open"}>
            {openChat.chat?<Chat openChat ={openChat} newMessage={(data)=>newChatMessage(data)} />:(<div className="chat-page">
            <h2 className="welcome" >Welcome to Chit Chat</h2>
        </div>)}
            </div>
        </div>
        {popup?popupContent:null}
        </>
    )
}

const mapStateToProps = state => {
    return {
      myfriends: state.auth.friends,
      mysidebarstatus: state.auth.sidebarStatus,
      mynewmessages:state.auth.newmessages,
      mytoken: state.auth.token,
      myemail:state.auth.email
    };
};

const mapDispatchToProps = dispatch => {
    return {
        postfriend: (postData) => dispatch(actions.postFriends(postData)),
        getmessages: (getData) => dispatch(actions.getMessages(getData)),
        postmessages: (postData) => dispatch(actions.postMessages(postData)),
        removemessages: (removeData) => dispatch(actions.removeMessages(removeData)),
        setsidebarstatus : (statusData) => dispatch(actions.sidebarStatus(statusData))
    };
};
    
export default connect(mapStateToProps, mapDispatchToProps)(Home)
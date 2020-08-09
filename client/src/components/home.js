import React,{useState,useEffect} from 'react'
import io from 'socket.io-client';
import image2 from '../images/realtor-2.jpg'
import Chat from "./chat";
import * as actions from '../store/actions/index';
import { connect } from 'react-redux';
import applyTheme from './theme'

const Home = props =>{
    const [socket, setSocket] = useState(null);
    const [currentTheme, setTheme] = React.useState("light");
    const [checked,setChecked] = useState(false);
    const [messageReceived,setReceivedMessage] = useState(null)
    const [popup,setPopup] = useState(false);
    const [openChat,setOpenChat] = useState({});
    const [activeIndex,setActiveIndex] = useState("");
     
    useEffect(() => {
        setSocket(io('',{query: `token=${props.mytoken}`}));
        // eslint-disable-next-line
    }, []);
    useEffect(()=>{
        if(socket){
            socket.emit("addSocket",props.myemail)
            socket.on("messagePosted",receiveddata=>{ 
                setReceivedMessage(receiveddata)
            })
        }
        return () => {
            if(socket){
                socket.disconnect()
            }
        }
        // eslint-disable-next-line
    },[socket])

    useEffect(()=>{
        if(messageReceived){
            console.log(messageReceived)
            props.postmessages(messageReceived,openChat,props.mymessages,props.mynewmessages)
        }
        // eslint-disable-next-line
    },[messageReceived])

    const newChatMessage = data =>{
        socket.emit("inputChatMessage",data)
        props.postmessages(data,openChat,props.mymessages,"direct")
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
        props.getmessages(activeFriend.email)
        setOpenChat(activeFriend)
        props.removemessages(props.mynewmessages ,activeFriend.email)
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
                        <div key={index} onClick={()=>chatClicked(index,friend)}className={className}>
                            {friend.avatar?<img className="imgg" src={`data:image/${friend.avatar.contentType} ;base64,${friend.avatar.image}`} alt="2" />:< img src={image2} className="imgg" alt="pp" />}
                            <h3 className="heading-3">
                                {friend.username}
                            </h3>
                            {props.mynewmessages&&props.mynewmessages[friend.email]>0?<div className="new-messages" style={{marginLeft:"auto",marginRight:"35px"}}>{props.mynewmessages[friend.email]}</div>:null}
                        </div>
                    )
                }):null}
            </div>
            <div className={props.mysidebarstatus?"chat-page-main":"chat-page-main chat-page-main-open"}>
            {openChat.email?<Chat openChat ={openChat} newMessage={(data)=>newChatMessage(data)} />:(<div className="chat-page">
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
      mynewmessages:state.auth.newMessages,
      mytoken: state.auth.token,
      mymessages : state.auth.messages,
      myemail:state.auth.email
    };
};

const mapDispatchToProps = dispatch => {
    return {
        postfriend: (postData) => dispatch(actions.postFriends(postData)),
        getmessages: (getData) => dispatch(actions.getMessages(getData)),
        postmessages: (postData,openchat,messages,newmessages) => dispatch(actions.postMessages(postData,openchat,messages,newmessages)),
        removemessages: (oldData,removeData) => dispatch(actions.removeMessages(oldData,removeData)),
        setsidebarstatus : (statusData) => dispatch(actions.sidebarStatus(statusData))
    };
};
    
export default connect(mapStateToProps, mapDispatchToProps)(Home)

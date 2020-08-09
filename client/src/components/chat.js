import React,{useEffect,useRef} from "react";
import { connect } from 'react-redux';

const Chat = props =>{
    let messageList = useRef(null)

    const scrollToBottom = () => {
        const scrollHeight = messageList.scrollHeight;
        const height = messageList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
    useEffect(()=>{
        if(props.mychat){
            scrollToBottom()
        }
    }, [props.mychat])

    const textSubmitted = e =>{
        e.preventDefault()
        props.newMessage({
            content:e.target.input.value,
            chat:props.mychat.chat,
            recipient:props.openChat.email,
            sender:props.myemail
        })
        e.target.input.value = ""
    }

    return(
        <div className="chat-page">
        <div className="chat__name" >
            {props.openChat.username}
        </div>
        <div className="messages" ref={(div) => {
            messageList = div;
            }}>
            {props.mychat&&props.mychat.messages?props.mychat.messages.map((mess,index)=>{
                return(
                <div key={index} className="message">
                    <div className="sender">
                    {mess.sender}
                    </div>
                    <div className="content">
                    {mess.content}
                    </div>
                </div>)
            }):null}
        </div>
        <form onSubmit={textSubmitted} className="compose">
            <input id="input" className="compose__input" type="text" placeholder="message...." required autoComplete="off" />
            <button type="submit">Send</button>
        </form>
        </div>
    )
}

const mapStateToProps = state => {
    return {
      mychat: state.auth.messages,
      myemail: state.auth.email
    };
};

export default connect(mapStateToProps)(Chat)


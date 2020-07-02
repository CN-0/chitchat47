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
        if(props.mymessages){
            scrollToBottom()
        }
    }, [props.mymessages])

    const textSubmitted = e =>{
        e.preventDefault()
        props.newMessage({
            content:e.target.input.value,
            chat:props.openChat.chat,
            recipient:props.openChat.friend,
            sender:props.myemail
        })
        e.target.input.value = ""
    }

    return(
        <div className="chat-page">
        <div className="chat__name" >
            {props.openChat.friend}
        </div>
        <div className="messages" ref={(div) => {
            messageList = div;
            }}>
            {props.mymessages?props.mymessages.map(mess=>{
                return(
                <div key={mess._id} className="message">
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
      mymessages: state.auth.messages.messages,
      myemail: state.auth.email
    };
};

export default connect(mapStateToProps)(Chat)


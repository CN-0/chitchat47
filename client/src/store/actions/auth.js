import Axios from 'axios';

import * as actionTypes from './actionTypes';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, email, username, friends, avatar,newMessages) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        email: email,
        username: username,
        friends:friends,
        avatar: avatar,
        newMessages:newMessages
    };
};

export const setMessages = (messages) => {
    return {
        type: actionTypes.SET_MESSAGES,
        messages:messages,
    };
};

export const setNewMessages = (messages) => {
    return {
        type: actionTypes.SET_NEW_MESSAGES,
        newmessages:messages
    };
};


export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const logout = (data) => {
    return dispatch => {
        const token = localStorage.getItem("cctoken")
        Axios.post('/users/logout',{newMessages:data},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
            localStorage.removeItem('cctoken');
            localStorage.removeItem('ccemail');
            localStorage.removeItem('ccusername');
            localStorage.removeItem('ccfriends');
            localStorage.removeItem('ccavatar');
            localStorage.removeItem('ccnewmessages');
        }).catch(err=>{
            console.log(err.response.data.msg)
        })
        dispatch({
            type: actionTypes.AUTH_LOGOUT
        })
    }
};

export const sidebarStatus = status =>{
    return{
        type:actionTypes.SET_SIDEBAR_STATUS,
        status:status
    }
}

export const postFriends = data =>{
    return dispatch => {
        dispatch(authStart())
        const token = localStorage.getItem("cctoken") 
        Axios.post('/chat/friends',{friend:data},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
            const avatar = response.data.avatar.image?response.data.avatar:null
            const fri = localStorage.getItem('ccfriends')
            const friends = fri?JSON.parse(fri):[];
            const newfriends = [...friends,{...response.data,avatar:avatar}]
            localStorage.setItem('ccfriends', JSON.stringify(newfriends));
            dispatch({
                type: actionTypes.ADD_FRIENDS,
                friends:newfriends,
            })
        }).catch(err=>{
            dispatch(authFail(err.response.data.msg))
        })
    }
}

export const getMessages = data =>{
    return dispatch => {
        dispatch(authStart())
        let ccktoken = localStorage.getItem("cctoken")
        Axios.get(`/chat/chat/${data}`,{headers:{Authorization:`Bearer ${ccktoken}`}}).then(response=>{  
            dispatch(setMessages(response.data))
        }).catch(err=>{
            dispatch(authFail(err.response.data.msg))
        })
    }
}

export const postMessages = (data,openchat,messages,newmessages) =>{
    return dispatch => {
        if(newmessages==="direct"||data.sender===openchat.email){
            dispatch(setMessages({...messages,messages:[...messages.messages,data]}))
        }else{
            let newMessage={}
            const sender = data.sender
            if(newmessages&&newmessages[sender]){
                newMessage[sender] = newmessages[sender] + 1
                localStorage.setItem('ccnewmessages', JSON.stringify({...newmessages,...newMessage}))
            }else{
                newMessage[sender] = 1
                localStorage.setItem('ccnewmessages', JSON.stringify(newMessage))
            }
            newmessages?dispatch(setNewMessages({...newmessages,...newMessage})):dispatch(setNewMessages(newMessage))
            
        }
    }
}
export const removeMessages = (oldmessages,data) =>{
    return dispatch => {
        if(oldmessages){
        oldmessages[data] = 0
        localStorage.setItem('ccnewmessages', JSON.stringify(oldmessages));
        dispatch(setNewMessages(oldmessages))
        }
    }
}

export const login = (loginData) => {
    return dispatch => {
        dispatch(authStart())
        let url = '/users/login'
        
        Axios.post(url, loginData)
            .then(response => {
                localStorage.setItem('cctoken', response.data.token);
                localStorage.setItem('ccemail', response.data.userData.email);
                localStorage.setItem('ccusername', response.data.userData.username);
                const newmessages = response.data.userData.newMessages
                if(newmessages){
                    localStorage.setItem('ccnewmessages', JSON.stringify(newmessages))
                }
                const friends = response.data.userData.friends
                if(friends.length>0){
                    localStorage.setItem('ccfriends', JSON.stringify(friends))
                }
                const avatar = response.data.userData.avatar
                if(avatar){
                    localStorage.setItem('ccavatar', JSON.stringify(avatar))
                }
                dispatch(authSuccess(response.data.token, response.data.userData.email, response.data.userData.username, response.data.userData.friends, response.data.userData.avatar, response.data.userData.newMessages));
            })
            .catch(err => {
                dispatch(authFail(err.response.data.msg))
            });
    };
};

export const register = (registerData) => {
    return dispatch => {
        dispatch(authStart())
        if(registerData.password !== registerData.cpassword){
            return dispatch(authFail("passwords don't match"))
        }
        let url = '/users/register'
        Axios.post(url, registerData)
            .then(response => {
                localStorage.setItem('cctoken', response.data.token);
                localStorage.setItem('ccemail', response.data.user.email);
                localStorage.setItem('ccusername', response.data.user.username);
                dispatch(authSuccess(response.data.token, response.data.user.email, response.data.user.username));
            })
            .catch(err => {
                if(err.response.data.msg.includes("username")){
                    dispatch(authFail("username max-length shouln't be more than 10 characters!"));        
                }else if(err.response.data.msg.includes("password")){
                    dispatch(authFail("password should have minimum of 6 characters!"));        
                }else if(err.response.data.msg.includes("email")){
                    dispatch(authFail("Email is already registered!"));        
                }else{
                    dispatch(authFail("network error"))
                }
            });
    };
};

export const updatePassword = password =>{
    const token = localStorage.getItem("cctoken") 
    return dispatch=>{
        dispatch(authStart())
        Axios.patch('/users/update',{password:password},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
            console.log(response.data)
        }).catch(err=>{
            if(err.response.data.msg.includes("password")){
                dispatch(authFail("password should have minimum of 6 characters!"));        
            }else{
                dispatch(authFail(err.response.data.msg))
            }
        })
    }
}

export const updataAvatar = avatar =>{
    const token = localStorage.getItem("cctoken")
    return dispatch=>{
        dispatch(authStart())
        Axios.put('/users/avatar',avatar,{headers:{Authorization:`Bearer ${token}`,'content-type': 'multipart/form-data'}}).then(response=>{
            localStorage.setItem('ccavatar', JSON.stringify(response.data));
            dispatch({
                type: actionTypes.CHANGE_AVATAR,
                avatar: response.data
            })
        }).catch(err=>{
            console.log(err)
        })
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('cctoken');
        if (!token) {
            //dispatch(logout());
        } else {
            const email = localStorage.getItem('ccemail')
            const username = localStorage.getItem('ccusername')
            const fri = localStorage.getItem('ccfriends')
            const friends = fri?JSON.parse(fri):null;
            const av = localStorage.getItem('ccavatar')
            const avatar = av?JSON.parse(av):null;
            const nms = localStorage.getItem('ccnewmessages')
            const newmessages = nms?JSON.parse(nms):null;
            dispatch(authSuccess(token, email, username, friends, avatar, newmessages));
             
        }
    };
};

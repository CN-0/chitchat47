import Axios from 'axios';

import * as actionTypes from './actionTypes';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, email, username, friends) => {
    let newMessages = {}
    friends.forEach(friend=>{
        newMessages[friend.chat] = 0
    })
    localStorage.setItem('ccnewmessages', JSON.stringify(newMessages));
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        email: email,
        username: username,
        friends:friends,
        newMessages:newMessages
    };
};

export const addFriends = (friends) => {
    return {
        type: actionTypes.ADD_FRIENDS,
        friends:friends,
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

export const logout = () => {
    const token = localStorage.getItem("cctoken") 
    Axios.post('/users/logout',{logout:"logout"},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
        console.log(response.data.msg)
    }).catch(err=>{
        console.log(err.response.data.msg)
    })
    localStorage.removeItem('cctoken');
    localStorage.removeItem('ccemail');
    localStorage.removeItem('ccusername');
    localStorage.removeItem('ccfriends');
    localStorage.removeItem('ccmessages');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};

export const sidebarStatus = status =>{
    return{
        type:actionTypes.SET_SIDEBAR_STATUS,
        status:status
    }
}

export const postFriends = data =>{
    return dispatch => {
        const token = localStorage.getItem("cctoken") 
        Axios.post('/users/friends',{friend:data},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
            localStorage.setItem('ccfriends', JSON.stringify(response.data));   
            dispatch(addFriends(response.data))
        }).catch(err=>{
            dispatch(authFail(err.response.data.msg))
        })
    }
}

export const getMessages = data =>{
    return dispatch => {
        let ccktoken = localStorage.getItem("cctoken")
        Axios.get(`/users/chat/${data}`,{headers:{Authorization:`Bearer ${ccktoken}`}}).then(response=>{
            localStorage.setItem('ccmessages', JSON.stringify(response.data));   
            dispatch(setMessages(response.data))
        }).catch(err=>{
            dispatch(authFail(err.response.data.msg))
        })
    }
}

export const postMessages = (data) =>{
    const openChat = JSON.parse(localStorage.getItem('ccmessages'))
    const oldmessages = JSON.parse(localStorage.getItem('ccnewmessages'))
    return dispatch => {
        if(openChat && openChat.chat === data.chat){
                localStorage.setItem('ccmessages', JSON.stringify(data));   
                dispatch(setMessages(data))
        }else{
            oldmessages[data.chat] = oldmessages[data.chat] + 1
            localStorage.setItem('ccnewmessages', JSON.stringify(oldmessages));
            dispatch(setNewMessages(oldmessages))
        }
        
        
    }
}
export const removeMessages = data =>{
    const oldmessages = JSON.parse(localStorage.getItem('ccnewmessages'))
    return dispatch => {
        oldmessages[data] = 0
        localStorage.setItem('ccnewmessages', JSON.stringify(oldmessages));
        dispatch(setNewMessages(oldmessages))
        
    }
}

export const login = (loginData) => {
    return dispatch => {
        dispatch(authStart())
        let url = '/users/login'
        
        Axios.post(url, loginData)
            .then(response => {
                localStorage.setItem('cctoken', response.data.token);
                localStorage.setItem('ccemail', response.data.user.email);
                localStorage.setItem('ccusername', response.data.user.username);
                localStorage.setItem('ccfriends', JSON.stringify(response.data.user.friends));
                dispatch(authSuccess(response.data.token, response.data.user.email, response.data.user.username, response.data.user.friends));
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
                localStorage.setItem('ccfriends', JSON.stringify(response.data.user.friends));
                dispatch(authSuccess(response.data.token, response.data.user.email, response.data.user.username, response.data.user.friends));
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

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('cctoken');
        if (!token) {
            dispatch(logout());
        } else {
            const email = localStorage.getItem('ccemail')
            const username = localStorage.getItem('ccusername')
            const friends = JSON.parse(localStorage.getItem('ccfriends'));
            const messages = JSON.parse(localStorage.getItem('ccmessages'));
            dispatch(authSuccess(token, email, username, friends,messages));
             
        }
    };
};

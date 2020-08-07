import Axios from 'axios';

import * as actionTypes from './actionTypes';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, email, username, friends, avatar) => {
    let newMessages = {}
    if(friends){
        friends.forEach(friend=>{
            newMessages[friend.chat] = 0
        })
    }
    localStorage.setItem('ccnewmessages', JSON.stringify(newMessages));
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        email: email,
        username: username,
        friends:friends,
        newMessages:newMessages,
        avatar: avatar
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
export const changeAvatar = (avatar) => {
    return {
        type: actionTypes.CHANGE_AVATAR,
        avatar: avatar
    };
};

export const logout = () => {
    const token = localStorage.getItem("cctoken") 
    Axios.post('http://localhost:5000/users/logout',{logout:"logout"},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
        localStorage.removeItem('cctoken');
        localStorage.removeItem('ccemail');
        localStorage.removeItem('ccusername');
        localStorage.removeItem('ccfriends');
        localStorage.removeItem('ccnewmessages');
        localStorage.removeItem('ccavatar');
        
    }).catch(err=>{
        console.log(err.response.data.msg)
    })
    return {
        type: actionTypes.AUTH_LOGOUT
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
        Axios.post('http://localhost:5000/users/friends',{friend:data},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
            localStorage.setItem('ccfriends', JSON.stringify(response.data.friends));   
            dispatch(addFriends(response.data.friends))
        }).catch(err=>{
            dispatch(authFail(err))
        })
    }
}

export const getMessages = data =>{
    return dispatch => {
        dispatch(authStart())
        let ccktoken = localStorage.getItem("cctoken")
        Axios.get(`http://localhost:5000/users/chat/${data}`,{headers:{Authorization:`Bearer ${ccktoken}`}}).then(response=>{
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
        let url = 'http://localhost:5000/users/login'
        
        Axios.post(url, loginData)
            .then(response => {
                localStorage.setItem('cctoken', response.data.token);
                localStorage.setItem('ccemail', response.data.user.email);
                localStorage.setItem('ccusername', response.data.user.username);
                localStorage.setItem('ccfriends', JSON.stringify(response.data.user.friends));
                const avatar = response.data.user.avatar
                if(avatar){
                    localStorage.setItem('ccavatar', JSON.stringify(avatar))
                }
                dispatch(authSuccess(response.data.token, response.data.user.email, response.data.user.username, response.data.user.friends, response.data.user.avatar));
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
        let url = 'http://localhost:5000/users/register'
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
        Axios.patch('http://localhost:5000/users/update',{password:password},{headers:{Authorization:`Bearer ${token}`}}).then(response=>{
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
        Axios.put('http://localhost:5000/avatar',avatar,{headers:{Authorization:`Bearer ${token}`,'content-type': 'multipart/form-data'}}).then(response=>{
            localStorage.setItem('ccavatar', JSON.stringify(response.data));
            dispatch(changeAvatar(response.data))
        }).catch(err=>{
            console.log(err)
        })
    }
}

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
            const av = localStorage.getItem('ccavatar')
            const avatar = av?JSON.parse(av):null;
            dispatch(authSuccess(token, email, username, friends, avatar));
             
        }
    };
};

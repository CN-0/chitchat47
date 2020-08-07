import io from "socket.io-client";

const token = localStorage.getItem('cctoken');

export const socket = io.connect('http://localhost:5000',{query: `token=${token}`});//window.location.hostname
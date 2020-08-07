import io from "socket.io-client";

const token = localStorage.getItem('cctoken');

export const socket = io.connect(window.location.hostname,{query: `token=${token}`});
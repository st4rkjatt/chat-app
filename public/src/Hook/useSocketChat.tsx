// useSocketChat.js

import { useEffect, useMemo } from 'react';
import io from 'socket.io-client';


export const useSocketChat = () => {

    const socket = useMemo(() => io("http://localhost:13000"), []);

    useEffect(() => {

        // socket.on('receiveMessage', (s) => {
        //     console.log(s, "ssssssssssssssss")
        // });



    }, []);


    // Function to send a message remains the same
    const sendChatMessage = ({ message, id }:any) => {
        socket.emit('sendMessageToUser', { recipientId: id, msg: message });
    };

    return { sendChatMessage };
};

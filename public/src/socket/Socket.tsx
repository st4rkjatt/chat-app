import io from 'socket.io-client';
// import { useDispatch } from 'react-redux';

// Assuming you have an action defined to add a new message to the chat

// Connect to the Socket.IO server
const socket = io('http://localhost:13000');

const useChat = () => {
    // const dispatch = useDispatch();

    // Listen for the 'welcome' event from the server
    socket.on('welcome', (message) => {
        console.log(message);
    });

    // Listen for incoming messages
    // socket.on('receiveMessage', ({ msg, senderId }:any) => {
    //     // Dispatch an action to add the received message to the Redux store
    //     dispatch(addMessageToChat({ message: msg, senderId }));
    // });

    // Function to send a message
    const sendMessage = ({ recipientId, message }:any) => {
        socket.emit('sendMessageToUser', { recipientId, msg: message });
    };

    return { sendMessage };
};

export default useChat;
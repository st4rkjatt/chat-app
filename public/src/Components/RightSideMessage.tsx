import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserChat, sendMessage, messageReceived } from '../reduxToolkit/Reducers/Auth.tsx/UsersSlice';
import InputField from './InputField';
import Button from './Button';
import io from 'socket.io-client';
import { AppDispatch } from '../reduxToolkit/Store';

// interface User {
//     _id: string;
//     avatarImage?: string;
//     userName: string;
// }

interface MessageItem {
    senderId: string;
    message: string;
}

interface State {
    usersReducers: {
        singleChat: MessageItem[];
    };
}

const RightSideMessage = ({ user }: any) => {
    const socket = useMemo(() => io("http://localhost:13000"), []);
    const dispatch: AppDispatch = useDispatch();
    const result = useSelector((state: State) => state.usersReducers);
    const userDetails:any = localStorage.getItem('user');
    // console.log(userDetails, 'userDetails in right side message')
    const userId = JSON.parse(userDetails)?.user?._id|| JSON.parse(userDetails)?._id;
    // console.log(userId, 'userId in right side message')
    const messageEndRef = useRef<HTMLDivElement | null>(null);
    const mainDivOfMessage = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    // Define a useRef to keep track of the timeout
    const typingTimeoutRef: any = useRef(null);

    useEffect(() => {
        if (user._id) {
            dispatch(getUserChat(user._id));
        }
        socket.on("connect", () => {
            const userData = {
                userId: userId,
                socketId: socket.id
            };
            socket.emit('registerUser', userData);
        });
        socket.on('receiveMessage', (receiveMessage: MessageItem) => {
            console.log(receiveMessage, 'rec')
            dispatch(messageReceived(receiveMessage));
            setIsTyping(false)

        });


        socket.on('typing', (data: { senderId: string, recipientId: string }) => {
            // Check if the typing event is meant for the current user
            if (data.recipientId === userId) {
                setIsTyping(true);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('receiveMessage');
            socket.off('typing');
        };
    }, [dispatch, socket, user._id, userId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [result.singleChat]);

    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        // Clear the previous timeout, if there is one
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (e.target.value) {
            socket.emit('typing', { senderId: userId, recipientId: user._id });

            // Set a new timeout
            typingTimeoutRef.current = setTimeout(() => {
                // Emit a "stop typing" event after 1 second of inactivity
                socket.emit('stopTyping', { senderId: userId, recipientId: user._id });
            }, 1000); // Adjust the delay as needed
        }
    };

    // Listen for the "stopTyping" event in your useEffect where you set up socket listeners
    useEffect(() => {
        // Existing socket event listeners
        socket.on('stopTyping', (data: { senderId: string, recipientId: string }) => {
            if (data.recipientId === userId) {
                setIsTyping(false);
            }
        });
        return () => {
            // Cleanup
            socket.off('stopTyping');
        };
    }, [socket, userId]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (message.trim()) {
            dispatch(sendMessage({ message, id: user._id }));
            console.log('message is differn', user._id, userId);
            socket.emit('sendMessageToUser', { recipientId: user._id, msg: message, senderId: userId });
            setMessage("");
        }
    };

    /** pagination scroll to bottom */
    const [isFetching, setIsFetching] = useState(false);
    // const [page, setPage] = useState(1);

    // Add an event listener to the message container to detect scrolling
    const handleScroll = () => {
        console.log('first')
        const { scrollTop, clientHeight, scrollHeight } = mainDivOfMessage.current!;
        if (scrollHeight - scrollTop === clientHeight) {
            // User has scrolled to the bottom, fetch more messages
            setIsFetching(true);
            console.log('onscrolll down')
        }
    };

    // Attach the scroll event listener when the component mounts
    // useEffect(() => {
    //     console.log('first1')

    //     mainDivOfMessage.current!.addEventListener('scroll', handleScroll);
    //     console.log('first2')

    //     return () => {
    //         mainDivOfMessage.current!.removeEventListener('scroll', handleScroll);
    //     };
    // }, []);


    // Fetch more messages when isFetching is true
    useEffect(() => {
        const fetchMoreMessages = async () => {
            // Fetch more messages using the page variable
            // Update the posts state with the new messages
            // Increment the page number
            dispatch(getUserChat(user._id));
            // setPage(prevPage => prevPage + 1);
            setIsFetching(false);
        };

        if (isFetching) {
            fetchMoreMessages();
        }
    }, [isFetching]);



    return (
        <>
            {/* {result.singleChat && result.singleChat.length > 0 ? ( */}
            <div className="col-span-4 ">
                <div className="w-full h-full border relative flex flex-col">
                    <div className="relative flex items-center p-3 border-b  border-gray-300">
                        <img
                            className="object-cover w-14 h-14 rounded-full border-sky-500 border-2"
                            src={user.avatarImage || "https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg"}
                            alt="username"
                        />
                        <span className="block ml-2 font-bold text-gray-600">{user.userName}</span>
                        <span className="absolute w-3 h-3 bg-green-600 rounded-full left-[54px] top-[17px]"></span>
                    </div>
                    <div ref={mainDivOfMessage}
                        className="scrollbar messageDivBg relative flex-grow p-6 overflow-y-auto h-[500px]"
                        id="style-16"
                        onScroll={handleScroll}>
                        <ul className="space-y-2">
                            {result?.singleChat?.map((item: MessageItem, i: number) => {
                                const isSender = item.senderId !== user._id;
                                const messageClass = isSender ? "justify-end" : "justify-start";
                                const containerClass = isSender ? "bg-gray-100" : "bg-white";
                                return (
                                    <li key={i}
                                        className={`flex ${messageClass}`}>
                                        <div className={`relative max-w-xl px-4 py-2 text-gray-700 rounded shadow ${containerClass}`}>
                                            <span className="block">{item.message}</span>
                                        </div>
                                    </li>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </ul>
                        {isTyping && <div className="p-2 text-sm italic text-white">Typing...</div>}
                    </div>
                    <div className="p-1 sm:mb-0 relative">
                        <form onSubmit={handleSubmit}>
                            <InputField
                                value={message}
                                name="message"
                                handleChange={handleChange}
                            />
                            <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                                <Button
                                    type={'Submit'}
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-6 w-6 ml-2 transform rotate-90"
                                        >
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>)
            {/* : 
                <EmptyMessageBox />} */}
        </>
    );
};

export default RightSideMessage;





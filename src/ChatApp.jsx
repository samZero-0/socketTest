import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chatify-5s1y.onrender.com/', {
    transports: ['websocket'],
});

export default function ChatApp() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messageEndRef = useRef(null);
    const messageContainerRef = useRef(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll whenever messages update

    useEffect(() => {
        const storedUsername = localStorage.getItem('chatUsername');
        if (storedUsername) {
            setUsername(storedUsername);
        } else {
            const newUsername = prompt("Enter your username");
            if (newUsername) {
                setUsername(newUsername);
                localStorage.setItem('chatUsername', newUsername);
            }
        }

        // Fetch initial messages
        socket.on('initial-messages', (initialMessages) => {
            setMessages(initialMessages);
            setIsLoading(false);
        });

        // Listen for new messages
        socket.on('message', (messageData) => {
            setMessages((prevMessages) => [...prevMessages, messageData]);
        });

        return () => {
            socket.off('initial-messages');
            socket.off('message');
        };
    }, []);

    const sendMessage = () => {
        if (input.trim() && username) {
            const messageData = {
                text: input.trim(),
                username: username,
                timestamp: new Date().toISOString()
            };
            socket.emit('message', messageData);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7tJKQ1KOQvWJQdtTlkBvzSOXs2A&s" alt="Logo" className="w-8 h-8 rounded-full mr-2" />
                        <h1 className="text-xl font-bold text-white">Chatify</h1>
                    </div>
                    <div className="text-white text-sm">{username}</div>
                </div>
                <div ref={messageContainerRef} className="h-96 overflow-y-auto p-4 bg-gray-100">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex mb-4 ${msg.username === username ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`bg-gray-200 w-full px-4 py-2 rounded-lg break-words overflow-hidden ${
                                        msg.username === username ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
                                    }`}>
                                        <div className="text-sm text-black font-semibold">{msg.username.toUpperCase()}</div>
                                        <div className="text-sm break-words overflow-wrap-anywhere text-gray-600">
                                            {msg.message || msg.text}
                                        </div>
                                        <div className="text-xs text-gray-400 text-right mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messageEndRef} /> {/* Invisible element to scroll to */}
                        </>
                    )}
                </div>
                <div className="bg-gray-200 p-4">
                    <div className="md:flex-row items-center flex flex-col gap-4 md:gap-0">
                        <input 
                            type="text" 
                            className="flex-1 p-2 rounded-xl md:rounded-l-full border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                            value={input} 
                            onChange={(e) => {
                                setInput(e.target.value);
                                setIsTyping(true);
                                setTimeout(() => setIsTyping(false), 2000);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                        />
                        <button 
                            className="bg-blue-500 text-white px-6 py-2 rounded-xl md:rounded-r-full hover:bg-blue-600 transition duration-300 ease-in-out"
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                    {isTyping && (
                        <div className="text-xs text-gray-500 mt-1 animate-pulse">
                            Someone is typing...
                        </div>
                    )}
                </div>
            </div>

            <p className='text-sm mt-10'>Made by Racist Nawal @samZero-0</p>
        </div>
    );
}
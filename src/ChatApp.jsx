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
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const messageEndRef = useRef(null);
    const messageContainerRef = useRef(null);
    const inputRef = useRef(null);

    const emojis = ['😊', '😂', '👍', '❤️', '🎉', '🔥', '👏', '🙏', '🤔', '😎'];

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

        // Simulate online users count
        setOnlineUsers(Math.floor(Math.random() * 10) + 3);
        const interval = setInterval(() => {
            setOnlineUsers(prev => Math.max(3, prev + (Math.random() > 0.5 ? 1 : -1)));
        }, 30000);

        return () => {
            socket.off('initial-messages');
            socket.off('message');
            clearInterval(interval);
        };
    }, []);

    const sendMessage = (emojiText = '') => {
        const messageText = emojiText || input.trim();
        if (messageText && username) {
            const messageData = {
                text: messageText,
                username: username,
                timestamp: new Date().toISOString()
            };
            socket.emit('message', messageData);
            setInput('');
            setShowEmojis(false);
            inputRef.current?.focus();
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
                   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center  ">
            <div className="w-full md:max-w-7xl max-w-lg bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 ">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Chatify</h1>
                            <div className="text-xs text-blue-100 flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                {onlineUsers} users online
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-black text-sm mr-2">
                            {username}
                        </div>
                        <button 
                            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
                            onClick={() => {
                                const newUsername = prompt("Change your username", username);
                                if (newUsername) {
                                    setUsername(newUsername);
                                    localStorage.setItem('chatUsername', newUsername);
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-.352-.035-.696-.1-1.028A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div 
                    ref={messageContainerRef} 
                    className="md:h-[600px] h-96 overflow-y-auto p-4 bg-gray-50"
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => {
                                const isMe = msg.username === username;
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">
                                                {msg.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={`max-w-3/4 md:w-1/3 px-4 py-2 rounded-lg shadow-sm ${
                                            isMe 
                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                        }`}>
                                            {!isMe && (
                                                <div className="text-xs font-semibold text-gray-600 mb-1">{msg.username}</div>
                                            )}
                                            <div className="text-sm break-words overflow-wrap-anywhere">
                                                {msg.message || msg.text}
                                            </div>
                                            <div className={`text-xs mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {formatTimestamp(msg.timestamp)}
                                            </div>
                                        </div>
                                        {isMe && (
                                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white ml-2 flex-shrink-0">
                                                {msg.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} /> {/* Invisible element to scroll to */}
                        </>
                    )}
                </div>

                {/* Input area */}
                <div className="bg-white p-4 border-t border-gray-200">
                    {isTyping && (
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                            <div className="flex space-x-1 mr-2">
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                            Someone is typing...
                        </div>
                    )}
                    <div className="flex items-center">
                        <button 
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition mr-1"
                            onClick={() => setShowEmojis(!showEmojis)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <input 
                            ref={inputRef}
                            type="text" 
                            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                            className="ml-2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition flex items-center justify-center"
                            onClick={() => sendMessage()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* Emoji picker */}
                    {showEmojis && (
                        <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-md flex flex-wrap">
                            {emojis.map((emoji, index) => (
                                <button 
                                    key={index}
                                    className="p-2 text-xl hover:bg-gray-100 rounded"
                                    onClick={() => sendMessage(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm mt-4 text-gray-500">
                Made by <span className="font-medium"><a href='https://github.com/samZero-0' target='_blank'>SamZero-0</a></span>
            </p>
        </div>
    );
}
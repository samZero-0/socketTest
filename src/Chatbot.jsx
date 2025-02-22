import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef(null);

  const { sendMessage, lastMessage } = useWebSocket(
    `ws://localhost:8080`
  );

  console.log(messages);
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages change

  useEffect(() => {
    if (lastMessage !== null) {
      setMessages((prev) => [...prev, { 
        text: lastMessage.data,
        isBot: true 
      }]);
    }
  }, [lastMessage]);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      setMessages((prev) => [...prev, { 
        text: inputValue,
        isBot: false 
      }]);
      
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">AI Assistant</h1>
                  <p className="text-sm text-gray-500">Always here to help</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="h-[600px] overflow-y-auto p-4 space-y-4"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${
                    message.isBot ? 'bg-gray-100' : 'bg-blue-500 text-white'
                  } p-4 rounded-2xl`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot ? 'bg-white' : 'bg-blue-600'
                    }`}>
                      {message.isBot ? (
                        <Bot className="w-5 h-5 text-blue-500" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="break-words">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  rows="1"
                  style={{ minHeight: '46px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Smart Responses</h3>
            <p className="text-sm text-gray-500 mt-1">AI-powered assistance</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">24/7 Available</h3>
            <p className="text-sm text-gray-500 mt-1">Always here to help</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Real-time Chat</h3>
            <p className="text-sm text-gray-500 mt-1">Instant responses</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatComponent;
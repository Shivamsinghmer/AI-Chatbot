import React, { useState, useRef, useEffect } from "react";
import AiInput from "./components/ui/ai-input";
import ThemeToggleButton from "./components/ui/theme-toggle-button";
import { io } from "socket.io-client";
import { LoaderOne } from "./components/ui/loader";
import ReactMarkdown from "react-markdown";
import Robot from "./components/ui/robot";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let socketInstance = io("http://localhost:3000/");
    setSocket(socketInstance);

    socketInstance.on("ai-message-response", (data) => {
      console.log("AI Response:", data);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: <ReactMarkdown>{data.response}</ReactMarkdown> },
      ]);
      setIsLoading(false);
      setInputMessage("");
    });
  }, []);

  // Handle sending message
  const handleSendMessage = async (e, msg) => {
    e.preventDefault();
    const messageToSend = msg ?? inputMessage;

    if (!messageToSend.trim()) return;

    const newMessage = { type: "user", content: messageToSend };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Emit the message through socket
    if (socket) {
      socket.emit("ai-message", messageToSend);
    }
  };

  return (
    <div>
      <div className="flex h-[95vh] bg-background relative">
        {/* Sidebar */}
        <div
          className={`
        fixed md:static w-[70%] md:w-[41%] h-full border-r border-border p-4 bg-background
        transform transition-transform duration-300 ease-in-out z-50
          md:transform-none hidden md:block
        `}
        >
          <div className="flex justify-between w-full items-center mb-4">
            <h2 className="text-2xl font-bold">MyChat</h2>
            <ThemeToggleButton variant="circle" start="center" />
          </div>
          <div className="flex-1 h-[90%] w-full flex items-center justify-center flex-col">
            <div className="h-[80%] w-full flex items-center justify-center">
              <Robot />
            </div>
            <p className="text-3xl font-bold pr-16 text-center mt-2">
              Hello..👋, I am Auri
            </p>
            <p className="text-xl font-bold pr-16 text-center mt-2">
              Your ChatBot
            </p>
          </div>
        </div>

        {/* Main Chat Area */}

        <div className="flex-1 flex flex-col">
          {/* Mobile Robot View */}
          <div className="md:hidden w-full h-[18vh] flex items-center justify-between px-6 border-b border-border bg-muted/30 backdrop-blur-sm ">
            <div className="h-full">
              <Robot />
            </div>
            <div className="flex flex-col ml-4 relative">
              <ThemeToggleButton
                variant="circle"
                className="absolute top-1 right-1"
              />
              <p className="text-lg font-semibold">Hello..👋, I am Auri</p>
              <p className="text-sm text-muted-foreground">Your ChatBot</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-20 space-y-4">
            {messages && messages.length > 0 ? (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      message.type === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground mb-1">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <div
                      className={`max-w-[90%] md:max-w-[70%] rounded-lg p-3 ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground mb-1">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <div className="bg-muted max-w-[90%] md:max-w-[70%] rounded-lg p-3">
                      <LoaderOne />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500">
                No messages yet. Start a conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex flex-col">
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="border-t border-border p-4"
            >
              <AiInput
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onSubmit={(msg) =>
                  handleSendMessage({ preventDefault: () => {} }, msg)
                }
                disabled={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="text-center py-2 text-sm text-muted-foreground border-t border-border">
        Made by{" "}
        <a
          className="font-bold text-md"
          href="https://shivamsinghmer.netlify.app"
        >
          Shivam
        </a>{" "}
        {"<-  "} Click Here
      </div>
    </div>
  );
}

export default App;

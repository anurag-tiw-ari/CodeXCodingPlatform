import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function BattleChat({ battleId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const { socket } = useSelector((state) => state.socket);

  useEffect(() => {

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, { role: "other", message: data }]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { role: "my", message: inputMessage }]);
    socket.emit("message", {
      message: inputMessage,
      battleId,
    });
    setInputMessage("");
  };

  return (
    <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl mt-3 h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)]">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Battle Chat</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "my" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                msg.role === "my"
                  ? "bg-blue-600 rounded-br-none"
                  : "bg-gray-700 rounded-bl-none"
              }`}
            >
              <p className="break-words">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input input-bordered bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="btn btn-primary bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default BattleChat;
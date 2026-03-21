import { useState } from "react";
import { findBestAnswer } from "../../utils/chatbot";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
    };

    const botResponse: Message = {
      sender: "bot",
      text: findBestAnswer(input),
    };

    setMessages([...messages, userMessage, botResponse]);
    setInput("");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", width: "300px" }}>
      <h3>Chatbot</h3>

      <div style={{ height: "200px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender === "user" ? "Toi" : "Bot"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Pose ta question..."
      />

      <button onClick={handleSend}>Envoyer</button>
    </div>
  );
}
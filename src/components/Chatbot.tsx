import { useState, useRef, useEffect } from "react";
import { findBestAnswer } from "../utils/chatbot";
import "../styles/Chatbot.css";

type Message = {
    sender: "user" | "bot";
    text: string;
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            sender: "bot",
            text: "Bonjour 👋 Je suis l’assistant TC Exchange. Je peux t’aider à trouver une destination, un pays, une langue ou un type d’échange.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const trimmedInput = input.trim();
        const userMessage: Message = { sender: "user", text: trimmedInput };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setIsTyping(true);

        try {
            const conversationHistory = updatedMessages.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
            }));

            const response = await findBestAnswer(
                trimmedInput,
                conversationHistory,
            );

            setMessages((prev) => [...prev, { sender: "bot", text: response }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Problème technique. Réessaie dans quelques instants.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatbot">
            {isOpen && (
                <div className="chatbot__window">
                    <div className="chatbot__header">
                        <div className="chatbot__header-left">
                            <div className="chatbot__avatar" aria-hidden="true">
                                <img
                                    src="/chatboticon.png"
                                    alt="Chatbot"
                                    className="chatbot__avatar-img"
                                />
                            </div>
                            <div>
                                <div className="chatbot__title">Bipboop TC</div>
                                <div className="chatbot__subtitle">
                                    En ligne
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="chatbot__close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Fermer le chatbot"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chatbot__messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot__message-row ${
                                    msg.sender === "user"
                                        ? "chatbot__message-row--user"
                                        : "chatbot__message-row--bot"
                                }`}
                            >
                                <div
                                    className={`chatbot__message ${
                                        msg.sender === "user"
                                            ? "chatbot__message--user"
                                            : "chatbot__message--bot"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chatbot__message-row chatbot__message-row--bot">
                                <div className="chatbot__message chatbot__message--bot chatbot__typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot__input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Écris ton message..."
                            className="chatbot__input"
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            className="chatbot__send"
                            aria-label="Envoyer"
                            disabled={!input.trim() || isTyping}
                        >
                            ➜
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                className="chatbot__toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Fermer le chatbot" : "Ouvrir le chatbot"}
            >
                <img
                    src="/chatboticon.png"
                    alt="Chatbot"
                    className="chatbot__toggle-img"
                />
            </button>
        </div>
    );
}

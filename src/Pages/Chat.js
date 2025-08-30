import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // 👈 for GitHub-flavored markdown (tables, strikethrough, etc.)
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const BACKEND = "http://127.0.0.1:5040";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, loading]);

  const cleanResponse = (text) => text.replace(/\[\d+\]/g, "");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatLog((prev) => [...prev, { sender: "user", text: message }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post(`${BACKEND}/chat`, { message });
      const botReply = cleanResponse(res.data.response || "");
      setChatLog((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setChatLog((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
        <div>
            <h1 className="text-center text-3xl p-3 bg-sky-300"><a className="text-red-500" href="/pdf-summarizer">click here</a> to file summarizer</h1>
            
        </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatLog.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-3xl whitespace-pre-wrap ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end w-fit ml-auto"
                : "bg-white text-gray-900 shadow-sm self-start mr-auto"
            }`}
          >
            {msg.sender === "bot" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]} // 👈 Enables tables & GFM
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 px-1 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3">
                        <table className="table-auto border-collapse border border-gray-400 w-full text-sm text-left">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-gray-400 px-3 py-2">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            ) : (
              msg.text
            )}
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 italic text-sm">Bot is typing…</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t flex items-center gap-3"
      >
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-3 outline-none focus:ring focus:ring-blue-200"
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;

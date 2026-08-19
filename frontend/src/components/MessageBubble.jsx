import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatTime(iso) {
  if (!iso) return "";

  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      <div className="message-row__avatar">
        {isUser && "U"}
      </div>

      <div className="message-col">
        <div className="message-meta">
          <span>{isUser ? "You" : "Nova"}</span>
          <span>{formatTime(message.createdAt)}</span>
        </div>

        <div
          className={`message-bubble ${
            message.isError ? "error" : ""
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
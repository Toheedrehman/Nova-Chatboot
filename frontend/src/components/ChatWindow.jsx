import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble.jsx";

const STARTER_PROMPTS = [
  "Explain this codebase to me",
  "Draft a launch announcement",
  "Debug a failing API request",
  "Brainstorm names for a feature",
];

export default function ChatWindow({ messages, isSending, onPromptSelect }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-window__scroll" ref={scrollRef}>
      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state__mark" />
          <div className="empty-state__title">Talk to Nova</div>
          <p className="empty-state__subtitle">
            Ask a question, paste some code, or start from one of these.
          </p>
          <div className="empty-state__prompts">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                className="empty-state__prompt"
                onClick={() => onPromptSelect(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-window__inner">
          {messages.map((m) => (
            <MessageBubble key={m.id || m._id} message={m} />
          ))}
          {isSending && (
            <div className="message-row assistant">
              <div className="message-row__avatar" />
              <div className="message-col">
                <div className="message-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

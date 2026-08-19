import React from "react";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatHeader({
  title = "Nova",
  online = true,
  onToggleSidebar,
}) {
  return (
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          type="button"
          className="chat-header__menu"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        <div className="chat-header__identity">
          <div className="chat-header__logo">
            <SparkIcon />
          </div>

          <div className="chat-header__heading">
            <div className="chat-header__title">{title}</div>

            <div className="chat-header__meta">
              <span
                className={`status-dot ${
                  online ? "is-online" : "is-offline"
                }`}
              />

              {online ? "Connected" : "Local preview"}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-header__model">
        <span className="chat-header__model-dot" />
        nova-1
      </div>
    </header>
  );
}
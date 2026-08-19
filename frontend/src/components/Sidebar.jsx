import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle
        cx="11"
        cy="11"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 16l4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
      <path
        d="M4 7h16M9 7V4h6v3M8 10v7M12 10v7M16 10v7M6 7l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m19.2 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1A1.8 1.8 0 0 0 3.1 12H3a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1A1.8 1.8 0 0 0 10.1 1.5V1.8a1.8 1.8 0 0 1 3.6 0V2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1A1.8 1.8 0 0 0 20.7 9h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.5 2.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar({
  chats = [],
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClose,
  onSettings,
}) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return chats;

    return chats.filter((chat) =>
      (chat.title || "New conversation")
        .toLowerCase()
        .includes(query)
    );
  }, [chats, search]);

  const handleDelete = (chatId) => {
    setOpenMenu(null);

    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  const handleNewChat = () => {
    setOpenMenu(null);

    if (onNewChat) {
      onNewChat();
    }

    if (onClose) {
      onClose();
    }
  };

  const handleSelect = (chatId) => {
    setOpenMenu(null);

    if (onSelectChat) {
      onSelectChat(chatId);
    }

    if (onClose) {
      onClose();
    }
  };

  const userName =
    user?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  const userEmail = user?.email || "";

  const initial = userName.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <SparkIcon />
          </div>

          <div className="sidebar__brand-text">
            <strong>Nova</strong>
            <span>AI Assistant</span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__new-chat"
          onClick={handleNewChat}
        >
          <PlusIcon />
          <span>New Chat</span>
        </button>

        <div className="sidebar__search">
          <SearchIcon />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
          />

          {search && (
            <button
              type="button"
              className="sidebar__search-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="sidebar__section-label">
          <span>Conversations</span>
          <span>{filteredChats.length}</span>
        </div>

        <div className="sidebar__history">
          {filteredChats.length === 0 ? (
            <div className="sidebar__empty">
              <div className="sidebar__empty-icon">
                <SparkIcon />
              </div>

              <strong>
                {search ? "No conversations found" : "No conversations yet"}
              </strong>

              <span>
                {search
                  ? "Try another search."
                  : "Start a new chat with Nova."}
              </span>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;

              return (
                <div
                  key={chat.id}
                  className={`sidebar__chat ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={() => handleSelect(chat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSelect(chat.id);
                    }
                  }}
                >
                  <div className="sidebar__chat-icon">
                    <SparkIcon />
                  </div>

                  <div className="sidebar__chat-content">
                    <div className="sidebar__chat-title">
                      {chat.title || "New conversation"}
                    </div>

                    <div className="sidebar__chat-preview">
                      {chat.preview || "No messages yet"}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="sidebar__chat-menu"
                    aria-label="Conversation options"
                    onClick={(e) => {
                      e.stopPropagation();

                      setOpenMenu((current) =>
                        current === chat.id ? null : chat.id
                      );
                    }}
                  >
                    <MoreIcon />
                  </button>

                  {openMenu === chat.id && (
                    <div
                      className="sidebar__context-menu"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleDelete(chat.id)}
                      >
                        <TrashIcon />
                        Delete chat
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="sidebar__bottom">
        <button
          type="button"
          className="sidebar__settings"
          onClick={onSettings}
        >
          <SettingsIcon />
          <span>Settings</span>
        </button>

        <div className="sidebar__user">
          <div className="sidebar__avatar">{initial}</div>

          <div className="sidebar__user-info">
            <strong>{userName}</strong>
            <span>{userEmail}</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="sidebar__logout"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import Sidebar from "../components/Sidebar.jsx";
import ChatHeader from "../components/ChatHeader.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import MessageInput from "../components/MessageInput.jsx";

import { api } from "../api.js";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loadingConversations, setLoadingConversations] =
    useState(true);

  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // =====================================================
  // NORMALIZE CONVERSATION ID
  // =====================================================

  const getConversationId = useCallback((conversation) => {
    if (!conversation) return null;

    return conversation._id || conversation.id || null;
  }, []);

  // =====================================================
  // LOAD CONVERSATIONS
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        setError("");

        const list = await api.listConversations();

        if (!mounted) return;

        const safeList = Array.isArray(list)
          ? list
          : [];

        setConversations(safeList);

        if (safeList.length > 0) {
          setActiveId(
            getConversationId(safeList[0])
          );
        } else {
          const convo =
            await api.createConversation();

          if (!mounted) return;

          setConversations([convo]);

          setActiveId(
            getConversationId(convo)
          );
        }
      } catch (err) {
        console.error(
          "Failed to load conversations:",
          err
        );

        if (!mounted) return;

        setError(
          err?.message ||
            "Failed to load conversations"
        );

        setConversations([]);
        setActiveId(null);
      } finally {
        if (mounted) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      mounted = false;
    };
  }, [getConversationId]);

  // =====================================================
  // LOAD MESSAGES
  // =====================================================

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const loadMessages = async () => {
      try {
        setError("");

        const msgs =
          await api.getMessages(activeId);

        if (!mounted) return;

        setMessages(
          Array.isArray(msgs)
            ? msgs
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load messages:",
          err
        );

        if (!mounted) return;

        setError(
          err?.message ||
            "Failed to load messages"
        );

        setMessages([]);
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [activeId]);

  // =====================================================
  // NEW CHAT
  // =====================================================

  const handleNewChat = useCallback(async () => {
    try {
      setError("");

      const convo =
        await api.createConversation();

      const newId =
        getConversationId(convo);

      if (!newId) {
        throw new Error(
          "Conversation ID was not returned by the server."
        );
      }

      setConversations((prev) => [
        convo,
        ...prev.filter(
          (item) =>
            getConversationId(item) !==
            newId
        ),
      ]);

      setActiveId(newId);
      setMessages([]);

      // Close sidebar on smaller screens.
      if (
        typeof window !== "undefined" &&
        window.innerWidth <= 900
      ) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error(
        "Create conversation error:",
        err
      );

      setError(
        err?.message ||
          "Failed to create conversation"
      );
    }
  }, [getConversationId]);

  // =====================================================
  // SELECT CHAT
  // =====================================================

  const handleSelectChat = useCallback(
    (id) => {
      if (!id) return;

      setActiveId(id);
      setError("");

      if (
        typeof window !== "undefined" &&
        window.innerWidth <= 900
      ) {
        setSidebarOpen(false);
      }
    },
    []
  );

  // =====================================================
  // DELETE CHAT
  // =====================================================

  const handleDeleteChat = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setError("");

        await api.deleteConversation(id);

        const updatedConversations =
          conversations.filter(
            (conversation) =>
              getConversationId(
                conversation
              ) !== id
          );

        setConversations(
          updatedConversations
        );

        if (id === activeId) {
          if (
            updatedConversations.length >
            0
          ) {
            const nextId =
              getConversationId(
                updatedConversations[0]
              );

            setActiveId(nextId);
          } else {
            setActiveId(null);
            setMessages([]);

            // Automatically create a new chat
            // so Nova never becomes unusable.
            const newConversation =
              await api.createConversation();

            const newId =
              getConversationId(
                newConversation
              );

            setConversations([
              newConversation,
            ]);

            setActiveId(newId);
          }
        }
      } catch (err) {
        console.error(
          "Delete conversation error:",
          err
        );

        setError(
          err?.message ||
            "Failed to delete conversation"
        );
      }
    },
    [
      conversations,
      activeId,
      getConversationId,
    ]
  );

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = useCallback(
    async (text) => {
      const cleanText =
        String(text || "").trim();

      if (!cleanText) return;

      if (!activeId) {
        setError(
          "Please create a conversation first."
        );
        return;
      }

      const temporaryUserMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: cleanText,
        createdAt:
          new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        temporaryUserMessage,
      ]);

      setIsSending(true);
      setError("");

      try {
        // =================================================
        // YOUR EXISTING GEMINI/BACKEND REQUEST
        // =================================================

        const reply =
          await api.sendMessage(
            activeId,
            cleanText
          );

        setMessages((prev) => [
          ...prev,
          reply,
        ]);

        // =================================================
        // UPDATE LOCAL CONVERSATION TITLE
        // =================================================

        setConversations((prev) =>
          prev.map((conversation) => {
            const id =
              getConversationId(
                conversation
              );

            if (
              id === activeId &&
              (
                !conversation.title ||
                conversation.title ===
                  "New chat" ||
                conversation.title ===
                  "New conversation"
              )
            ) {
              return {
                ...conversation,
                title:
                  cleanText.length > 40
                    ? `${cleanText.slice(
                        0,
                        40
                      )}…`
                    : cleanText,
                preview: cleanText,
                updatedAt:
                  new Date().toISOString(),
              };
            }

            if (id === activeId) {
              return {
                ...conversation,
                preview:
                  cleanText.length > 55
                    ? `${cleanText.slice(
                        0,
                        55
                      )}…`
                    : cleanText,
                updatedAt:
                  new Date().toISOString(),
              };
            }

            return conversation;
          })
        );
      } catch (err) {
        console.error(
          "Nova chat error:",
          err
        );

        const errorMessage =
          err?.message ||
          "Something went wrong.";

        setError(errorMessage);

        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              `Nova error: ${errorMessage}`,
            isError: true,
            createdAt:
              new Date().toISOString(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [activeId, getConversationId]
  );

  // =====================================================
  // SETTINGS
  // =====================================================

  const handleSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  // =====================================================
  // ACTIVE CONVERSATION
  // =====================================================

  const activeConvo =
    conversations.find(
      (conversation) =>
        getConversationId(
          conversation
        ) === activeId
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loadingConversations) {
    return (
      <div className="app-shell nova-loading-screen">
        <div className="nova-loading-card">
          <div className="nova-loading-orb">
            ✦
          </div>

          <div className="nova-loading-title">
            Nova
          </div>

          <div className="nova-loading-text">
            Loading your conversations…
          </div>

          <div className="nova-loading-line">
            <span />
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={`app-shell ${
        sidebarOpen
          ? "sidebar-is-open"
          : "sidebar-is-closed"
      }`}
    >
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <Sidebar
        chats={conversations.map(
          (conversation) => {
            const id =
              getConversationId(
                conversation
              );

            return {
              ...conversation,
              id,
              title:
                conversation.title ||
                "New conversation",
              preview:
                conversation.preview ||
                conversation.lastMessage ||
                "No messages yet",
            };
          }
        )}
        activeChatId={activeId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onClose={() =>
          setSidebarOpen(false)
        }
        onSettings={handleSettings}
      />

      {/* MAIN CHAT */}

      <main className="chat-window">
        <ChatHeader
          title={
            activeConvo?.title ||
            "New chat"
          }
          online={!error}
          onToggleSidebar={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
        />

        {/* ERROR BAR */}

        {error && (
          <div className="nova-error-bar">
            <span className="nova-error-dot" />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* MESSAGES */}

        <ChatWindow
          messages={messages}
          isSending={isSending}
          onPromptSelect={handleSend}
        />

        {/* INPUT */}

        <MessageInput
          onSend={handleSend}
          disabled={
            isSending || !activeId
          }
        />

        {/* SETTINGS MODAL */}

        {settingsOpen && (
          <div
            className="nova-settings-backdrop"
            onClick={() =>
              setSettingsOpen(false)
            }
          >
            <div
              className="nova-settings-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="nova-settings-header">
                <div>
                  <span className="nova-settings-eyebrow">
                    NOVA
                  </span>

                  <h2>Settings</h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>

              <div className="nova-settings-item">
                <div>
                  <strong>AI Model</strong>
                  <span>
                    Current Nova model
                  </span>
                </div>

                <span className="nova-settings-value">
                  nova-1
                </span>
              </div>

              <div className="nova-settings-item">
                <div>
                  <strong>Theme</strong>
                  <span>
                    Modern dark interface
                  </span>
                </div>

                <span className="nova-settings-value">
                  Dark
                </span>
              </div>

              <div className="nova-settings-item">
                <div>
                  <strong>Storage</strong>
                  <span>
                    Conversations
                    are stored through
                    your backend.
                  </span>
                </div>

                <span className="nova-settings-value">
                  MongoDB
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
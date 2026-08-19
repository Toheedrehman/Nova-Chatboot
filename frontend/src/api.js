const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const getToken = () => {
  return localStorage.getItem("nova_token");
};

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

export const api = {
  baseURL: API_URL,

  // ================================================
  // GENERIC REQUESTS
  // ================================================

  request,

  get(endpoint) {
    return request(endpoint, {
      method: "GET",
    });
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE",
    });
  },

  // ================================================
  // CONVERSATIONS
  // ================================================

  async listConversations() {
    const data = await request(
      "/api/conversations",
      {
        method: "GET",
      }
    );

    return data.conversations || data || [];
  },

  async createConversation() {
    const data = await request(
      "/api/conversations",
      {
        method: "POST",
        body: JSON.stringify({
          title: "New chat",
        }),
      }
    );

    return data.conversation || data;
  },

  async deleteConversation(id) {
    return request(
      `/api/conversations/${id}`,
      {
        method: "DELETE",
      }
    );
  },

  // ================================================
  // MESSAGES
  // ================================================

  async getMessages(conversationId) {
    const data = await request(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "GET",
      }
    );

    return data.messages || data || [];
  },

  // ================================================
  // REAL NOVA AI MESSAGE
  // ================================================

  async sendMessage(conversationId, message) {
    const data = await request(
      `/api/chat/${conversationId}`,
      {
        method: "POST",

        body: JSON.stringify({
          message,
        }),
      }
    );

    return (
      data.message ||
      data.reply ||
      data.response ||
      {
        role: "assistant",
        content: "Nova did not return a response.",
        createdAt: new Date().toISOString(),
      }
    );
  },
};

export default API_URL;
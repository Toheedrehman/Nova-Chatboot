import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API_URL from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // LOAD SAVED LOGIN
  // ===================================================

  useEffect(() => {
    const token = localStorage.getItem("nova_token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("nova_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (email, password) => {
    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    localStorage.setItem(
      "nova_token",
      data.token
    );

    setUser(data.user);

    return data;
  };

  // ===================================================
  // SIGNUP
  // ===================================================

  const signup = async (
    name,
    email,
    password
  ) => {
    const response = await fetch(
      `${API_URL}/api/auth/signup`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Signup failed"
      );
    }

    localStorage.setItem(
      "nova_token",
      data.token
    );

    setUser(data.user);

    return data;
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem("nova_token");
    setUser(null);
  };

  // ===================================================
  // VALUE
  // ===================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
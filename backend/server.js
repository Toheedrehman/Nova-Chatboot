require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const chatRoutes = require("./routes/chatRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",

  // Production frontend
  "https://nova-chatboot-zouf.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // such as server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("Blocked CORS origin:", origin);

    // Do NOT throw here.
    // Returning false prevents crashing the
    // serverless function because of CORS.
    return callback(null, false);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));

// Handle browser preflight requests
app.options("*", cors(corsOptions));

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Nova API is running",
  });
});

// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// CONVERSATIONS
// =====================================================

app.use(
  "/api/conversations",
  conversationRoutes
);

// =====================================================
// AI CHAT
// =====================================================

app.use(
  "/api/chat",
  chatRoutes
);

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  // CORS errors or other errors
  res.status(error.status || 500).json({
    success: false,
    message:
      error.message ||
      "Server error",
  });
});

// =====================================================
// LOCAL DEVELOPMENT ONLY
// =====================================================

if (process.env.NODE_ENV !== "production") {
  const PORT =
    process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Nova server running on http://localhost:${PORT}`
    );
  });
}

// =====================================================
// VERCEL
// =====================================================

module.exports = app;
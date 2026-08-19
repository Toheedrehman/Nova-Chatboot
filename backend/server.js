require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nova-chatboot.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Server-to-server / curl / health checks
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked:", origin);
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

app.use(cors(corsOptions));

// Explicit OPTIONS handler
app.options(/.*/, cors(corsOptions));

// =====================================================
// EXPLICIT CORS HEADER
// =====================================================

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header(
      "Access-Control-Allow-Origin",
      origin
    );
    res.header(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// =====================================================
// DATABASE
// =====================================================

connectDB();

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

app.use("/api/auth", authRoutes);

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

app.use("/api/chat", chatRoutes);

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

  const origin = req.headers.origin;

  if (
    origin &&
    allowedOrigins.includes(origin)
  ) {
    res.header(
      "Access-Control-Allow-Origin",
      origin
    );
    res.header(
      "Access-Control-Allow-Credentials",
      "true"
    );
  }

  res.status(error.status || 500).json({
    success: false,
    message:
      error.message || "Server error",
  });
});

// =====================================================
// LOCAL DEVELOPMENT ONLY
// =====================================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

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
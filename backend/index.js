import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./src/routes/taskRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Comprehensive CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Important for credentials support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route to check API is working
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// Task routes
app.use("/api/tasks", taskRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle server startup errors
server.on("error", (error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});

export default app;

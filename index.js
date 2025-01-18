import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import hpp from "hpp"
import helmet from "helmet"
import mongooseSanitizer from "express-mongo-sanitize"
import cookieParser from "cookie-parser"
import cors from "cors"

dotenv.config();

const app = express(); 
// Initialize an Express application instance.

const PORT = process.env.PORT; 
// Retrieve the port number from environment variables for the server to listen on.

// Global rate limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Allow requests within a 15-minute window.
    limit: 100, // Maximum of 100 requests per IP during the window.
    message: "Too many requests from this IP, please try later" // Message sent if rate limit is exceeded.
});

app.use(helmet()); 
// Helmet secures the application by setting various HTTP headers (e.g., Content-Security-Policy).

app.use(mongooseSanitizer()); 
// Prevents NoSQL injection attacks by sanitizing user input data.

app.use(hpp()); 
// Prevents HTTP parameter pollution by rejecting duplicate query parameters.

app.use('/api', limiter); 
// Applies the rate limiter middleware only to routes prefixed with "/api".

app.use(cookieParser()); 
// Parses cookies attached to incoming requests and makes them available in `req.cookies`.

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    // Specifies the allowed client origin for cross-origin requests.
    credentials: true, 
    // Enables sending cookies and authorization headers across origins.
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"], 
    // Lists allowed HTTP methods for CORS requests.
    allowedHeaders: [ 
        "Content-Type", "Authorization", "X-Requested-With", 
        "device-remember-token", "Access-Control-Allow-Origin", "Origin", "Accept"
    ], 
    // Specifies which headers can be used in the actual request.
}));

// Logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev')); 
    // Logs HTTP requests in development mode for easier debugging.
}

// Body parser middleware
app.use(express.json({ limit: '10kb' })); 
// Parses incoming JSON payloads with a maximum size of 10KB.

app.use(express.urlencoded({ extended: true, limit: '10kb' })); 
// Parses URL-encoded form data, extending support for rich objects, and limits data size to 10KB.

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); 
    // Logs the error stack trace to the console.
    res.status(err.status || 500).json({ 
        // Responds with an error message and status code (default: 500 Internal Server Error).
        status: "error",
        message: err.message || "Internal server error", 
        // Custom or default error message.
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
        // Adds stack trace in the response if in development mode.
    });
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        // Responds with a 404 status code for unmatched routes.
        status: "error",
        message: "Route not found", 
        // Custom error message for not found routes.
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Your server is running on http://localhost:${PORT} in ${process.env.NODE_ENV}`); 
    // Logs the server's address and environment mode when it starts.
});

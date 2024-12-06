import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // Import cors middleware
import notFoundHandler from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";
import logger from "./middleware/logger.js";
import path from "path";

// router imports
import userRouter from "./routes/user.router.js";
import recipeRouter from "./routes/recipe.router.js";

// Initialize express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: '*', // Allows all origins (consider restricting this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allows cookies to be sent
};

app.use(cors(corsOptions)); // Use CORS middleware

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use(cookieParser());
app.use(logger);

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/recipe", recipeRouter);

// error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export { app };

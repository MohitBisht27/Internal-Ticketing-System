import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

import userRouter from "./routes/user.routes.js";
import ticketRoute from "./routes/ticket.routes.js";
import commentRoute from "./routes/comment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tickets", ticketRoute);
app.use("/api/v1/comments", commentRoute);

export { app };

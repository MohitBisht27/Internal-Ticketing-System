import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

const app = express();

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Routes
import userRouter from "./routes/user.routes.js";
import ticketRoute from "./routes/ticket.routes.js";
import commentRoute from "./routes/comment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tickets", ticketRoute);
app.use("/api/v1/comments", commentRoute);

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-ticket", (ticketId) => {
    socket.join(ticketId);
    console.log(`Joined ticket: ${ticketId}`);
  });

  socket.on("leave-ticket", (ticketId) => {
    socket.leave(ticketId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export { app, server };

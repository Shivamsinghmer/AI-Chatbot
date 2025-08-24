import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import { generateResponse } from "./src/service/ai.service.js";
import cors from "cors";

app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
  methods: ["GET", "POST"],
  credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

const chatHistory = [];

io.on("connection", (socket) => {
  socket.on("ai-message", async (chat) => {
    try {
      chatHistory.push({
        role: "user",
        parts: [{ text: chat }],
      });

      const response = await generateResponse(chatHistory);
      socket.emit("ai-message-response", { response });

      chatHistory.push({
        role: "model",
        parts: [{ text: response }],
      });
    } catch (error) {
      console.error("Error processing AI message:", error);
      socket.emit("error", { message: "Failed to process message" });
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

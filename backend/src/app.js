import express from "express";
import dotenv from "dotenv";
import { generateResponse } from "./service/ai.service.js";

dotenv.config();

const app = express()
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

export default app
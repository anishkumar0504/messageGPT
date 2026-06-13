import express from "express";
import cors from "cors";
import http from "http";

import authRouter from "./auth/auth";
import { initializeSocketServer } from "./websocket/socket";
import roomRouter from "./room/room";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/room", roomRouter);
const server = http.createServer(app);

initializeSocketServer(server);

server.listen(3000, () => {
    console.log("Server running");
});
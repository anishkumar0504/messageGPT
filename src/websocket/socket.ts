import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleConnection } from "./room";

export function initializeSocketServer(httpServer: Server) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        handleConnection(socket, io);
    });
}
import { Server } from "http";
import { Server as SocketIOServer } from "socket.io";

export function initializeSocketServer(httpServer:Server){
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", (socket) => {
        console.log("A user connected",socket.id);
        
        socket.on("disconnect", () => {
            console.log("A user disconnected",socket.id);
        });
    }
)
}
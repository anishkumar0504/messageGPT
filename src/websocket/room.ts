import { Socket, Server } from "socket.io";

export function handleConnection(
    socket: Socket,
    io: Server
) {
    console.log("Connected:", socket.id);

    socket.on("create-room", (roomId: string) => {
        socket.join(roomId);

        console.log(`Room ${roomId} created`);

        socket.emit("room-created", roomId);
    });

    socket.on("join-room", (roomId: string) => {
        socket.join(roomId);

        console.log(`${socket.id} joined ${roomId}`);

        socket.emit("joined-room", roomId);
    });

socket.on(
    "chat",
    ({
        roomId,
        message,
        from,
    }: {
        roomId: string;
        message: string;
        from: string;
    }) => {
        socket.to(roomId).emit("chat", {
            from,
            text: message,
            ts: Date.now(),
        });
    }
);

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
    });
}
import { Router } from "express";
import crypto from "crypto";

const router = Router();

type Room = {
    roomId: string;
    users: string[];
};

export const rooms = new Map<string, Room>();

router.post("/create", (req, res) => {
    const roomId = crypto.randomUUID();

    rooms.set(roomId, {
        roomId,
        users: [],
    });

    res.json({
        roomId,
    });
});

router.post("/join", (req, res) => {
    const { roomId, username } = req.body;

    const room = rooms.get(roomId);

    if (!room) {
        return res.status(404).json({
            message: "Room not found",
        });
    }

    if (room.users.length >= 2) {
        return res.status(400).json({
            message: "Room full",
        });
    }

    room.users.push(username);

    res.json({
        success: true,
    });
});

export default router;
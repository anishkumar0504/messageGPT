import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {Router} from "express";

const router = Router();
router.get("/", (req, res) => {
  res.send("Hello World!");
});
const users: { username: string; password: string }[] = [];

router.post("/signup",(req,res)=>{
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    console.log(users);
    res.status(201).json({ message: "User created successfully" });
})

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: "Invalid username or password" });
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ username }, "secret", { expiresIn: "1h" });
    res.json({ token });
}
)
export default router;
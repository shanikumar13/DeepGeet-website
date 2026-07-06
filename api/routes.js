import express from "express";
import { generateReply } from "./ai.js";

const router = express.Router();

router.post("/chat", async (req, res) => {

    try {

        const { message, model } = req.body;

        if (!message) {

            return res.status(400).json({
                reply: "Message is required."
            });

        }

        const reply = await generateReply(message, model);

        res.json({
            reply
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            reply: "Something went wrong."
        });

    }

});

export default router;
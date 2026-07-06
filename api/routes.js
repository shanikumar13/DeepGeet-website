import express from "express";
import { generateReply } from "./ai.js";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const router = express.Router();

// Initialize the MsEdgeTTS client
const tts = new MsEdgeTTS();

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

router.get("/tts", async (req, res) => {
    try {
        const { text, lang } = req.query;
        if (!text) {
            return res.status(400).send("Text is required.");
        }

        // hi-IN-MadhurNeural is a premium, natural, warm Hindi Male voice
        // en-US-BrianNeural is a premium, natural, clear English Male voice
        let voiceName = "hi-IN-MadhurNeural";
        if (lang === "en-US" || lang === "en") {
            voiceName = "en-US-BrianNeural";
        }

        await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {});
        
        const { audioStream } = tts.toStream(text);

        res.set({
            "Content-Type": "audio/mpeg",
            "Transfer-Encoding": "chunked"
        });

        audioStream.pipe(res);

        audioStream.on("error", (streamErr) => {
            console.error("TTS stream error:", streamErr);
            if (!res.headersSent) {
                res.status(500).send("TTS stream error");
            }
        });

    } catch (err) {
        console.error("TTS generation failed:", err);
        if (!res.headersSent) {
            res.status(500).send("TTS generation failed");
        }
    }
});

export default router;
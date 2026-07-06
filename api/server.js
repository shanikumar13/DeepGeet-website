import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes under both /api and / to handle Vercel rewrites robustly
app.use("/api", routes);
app.use("/", routes);

app.use(express.static(path.join(__dirname, "../")));

// Only start the persistent listener if NOT running in Vercel Serverless environment
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`✅ DeepGeet Backend Running on Port ${PORT}`);
    });
}

export default app;
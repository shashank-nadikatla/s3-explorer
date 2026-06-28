import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import { router } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 8090;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "s3-explorer-dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000, // 1 hour
    },
  })
);

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`S3 Explorer API running on http://localhost:${PORT}`);
});

import express, { Express } from "express";
import { userRouter } from "./routes/user.router";
import { fileRouter } from "./routes/file.router";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import limiter from "./middlewares/ratelimit";
const app: Express = express();

dotenv.config();
app.use(limiter);
app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/file", fileRouter);

export default app;

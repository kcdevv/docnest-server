import express from "express";
import cors from "cors";
import limiter from "./middlewares/ratelimit";
import connectDB from "./db";
import userRouter from "./routes/user.router";
import { config } from "dotenv";
import cookieParser from "cookie-parser"
import fileRouter from "./routes/file.router";

const app = express();
config({
  path: ".env",
});

connectDB();

app.use(cors());
app.use(limiter);
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/files", fileRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

export default app;

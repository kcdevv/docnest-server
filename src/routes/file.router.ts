import express from "express";
import { uploadFile, getFiles } from "../controllers/file.controller";
import isAuth from "../middlewares/isAuth";

const fileRouter = express.Router();

fileRouter.post("/upload", isAuth, uploadFile);
fileRouter.get("/files",getFiles);

export default fileRouter;

import { Router } from "express";
import { deleteFile, generateUploadURL, getDownloadUrl, getFiles, saveFile } from "../controllers/file.controller";
import isAuth from "../middlewares/isAuth";

export const fileRouter = Router();

fileRouter.post("/puturl", isAuth, generateUploadURL);
fileRouter.post("/save-file", isAuth, saveFile);
fileRouter.post("/download",isAuth,getDownloadUrl);
fileRouter.delete("/:fileId",isAuth,deleteFile);
fileRouter.get("/files",isAuth,getFiles);
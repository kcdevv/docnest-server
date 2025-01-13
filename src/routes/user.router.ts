import express, { Request, Response, NextFunction } from "express";
import {
  signUpUser,
  signInUser,
  updateUser,
  userProfile,
  getUserFiles
} from "../controllers/user.controller";
import isAuth from "../middlewares/isAuth";

const userRouter = express.Router();

userRouter.use("/update", isAuth);
userRouter.use("/profile", isAuth);

userRouter.post("/signup", signUpUser);
userRouter.post("/signin", signInUser);
userRouter.get("/profile",userProfile);
userRouter.put("/update", updateUser);
userRouter.get("/:userId/files",getUserFiles);

export default userRouter;

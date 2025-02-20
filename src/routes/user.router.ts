import { Router } from "express";
import { getProfile, logoutUser, pay, signinUser, signupUser, updateUser, verifyPayment } from "../controllers/user.controller";
import isAuth from "../middlewares/isAuth";

export const userRouter = Router();

userRouter.post("/signup", signupUser);
userRouter.post("/signin", signinUser);
userRouter.put("/edit", isAuth,updateUser);
userRouter.get("/me", isAuth,getProfile);
userRouter.get("/logout", isAuth,logoutUser);
userRouter.post("/pay", isAuth,pay);
userRouter.post("/verfify-payment", isAuth,verifyPayment);
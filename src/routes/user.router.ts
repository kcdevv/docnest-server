import { Router } from "express";
import { logoutUser, pay, updateUser, verifyPayment } from "../controllers/user.controller";
import isAuth from "../middlewares/isAuth";

export const userRouter = Router();

userRouter.put("/edit", isAuth,updateUser);
userRouter.get("/logout", isAuth,logoutUser);
userRouter.post("/pay", isAuth,pay);
userRouter.post("/verfify-payment", isAuth,verifyPayment);
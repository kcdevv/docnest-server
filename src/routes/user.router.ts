import { Router } from "express";
import { getUser, pay, updateUser, userCreated, verifyPayment } from "../controllers/user.controller";
import isAuth from "../middlewares/isAuth";

export const userRouter = Router();

userRouter.put("/edit", isAuth, updateUser);
userRouter.post("/create",userCreated);
userRouter.post("/pay", isAuth, pay);
userRouter.post("/verfify-payment", isAuth, verifyPayment);
userRouter.get("/me", isAuth, getUser);
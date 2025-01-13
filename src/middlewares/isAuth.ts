import { Request, Response, NextFunction } from "express";
import verifyToken from "./verifyToken";

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;
  const isVerified = verifyToken(token);
  if (isVerified && typeof isVerified !== "string") {
    // console.log(isVerified.userId);
    // @ts-ignore
    req.userId = isVerified.userId;
    next();
  } else {
    res.status(401).json({
      message: "Unauthorized access",
    });
  }
};

export default isAuth;

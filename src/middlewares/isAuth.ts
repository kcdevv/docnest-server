import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/verifyToken";
import { JwtPayload } from "jsonwebtoken";

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization || req.cookies.token;
  const isVerified = verifyToken(token) as JwtPayload;
  if (isVerified) {
    req.userId = isVerified.id;
    console.log(req.userId);
    next();
  } else {
    res.status(401).json({
      message: "Unauthorized access",
    });
    return;
  }
};

export default isAuth;
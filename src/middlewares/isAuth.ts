import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] ?? "";
  if (!token) {
    res.json({ message: "Unauthorized" });
    return;
  }
  const decoded = verify(token, process.env.CLERK_SECRET_KEY!, {
    algorithms: ["RS256"],
  });
  
  if (!decoded) {
    res.json({ message: "Unauthorized" });
    return;
  }

  const userId = decoded.sub as string;
  req.userId = userId;
  next();
};

export default isAuth;

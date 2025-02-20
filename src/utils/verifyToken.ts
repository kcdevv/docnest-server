import { verify } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.JWT_SECRET);
export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET ?? "secret");
    return decoded;
  } catch (error) {
    return error;
  }
};
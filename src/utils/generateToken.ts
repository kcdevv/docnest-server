import { sign } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.JWT_SECRET);

export const generateToken = (id: string) => {
  return sign({ id }, process.env.JWT_SECRET ?? "secret", {
    expiresIn: "30d",
  });
};
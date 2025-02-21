import { sign } from "jsonwebtoken";
import dotenv from "dotenv";
import getSecret from "./getSecret";
dotenv.config();

export const generateToken = (id: string) => {
  return sign({ id }, getSecret(), {
    expiresIn: "30d",
  });
};

import { JwtPayload, verify } from "jsonwebtoken";
import getSecret from "./getSecret";

export const verifyToken = (token: string) => {
  try {
    const secret = getSecret();
    const decoded = verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    return error;
  }
};
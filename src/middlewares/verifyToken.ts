import { verify } from "jsonwebtoken";
import getSecret from "../utils/getSecret";

const verifyToken = (token: string) => {
  const secret = getSecret();
  const decoded = verify(token, secret);
  if (!decoded) return null;
  return decoded;
};

export default verifyToken
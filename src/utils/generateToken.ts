import { sign } from "jsonwebtoken";
import getSecret from "./getSecret";

export const generateToken = (id: string) => {
  return sign({ id }, getSecret(), {
    expiresIn: "30d",
  });
};

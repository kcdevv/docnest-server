import { config } from "dotenv";

const getSecret = () => {
  return process.env.SECRET ?? "";
};

export default getSecret;

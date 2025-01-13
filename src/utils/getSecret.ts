const getSecret = () => {
  return process.env.SECRET ?? "";
};

export default getSecret;

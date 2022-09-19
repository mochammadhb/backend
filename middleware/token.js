import jwt from "jsonwebtoken";

export const withToken = async (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (!token || token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403);

    req.user_id = decoded.user_id;
    req.username = decoded.username;
    req.email = decoded.email;

    next();
  });
};

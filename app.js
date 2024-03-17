import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.get("/data", authenticateToken, (req, res) =>
  res.status(200).json(req.user.name)
);

function authenticateToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(process.env.PORT);

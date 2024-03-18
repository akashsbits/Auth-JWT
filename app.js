import "dotenv/config";
import express from "express";
import verifyToken from "./middlewares/auth.js";

const app = express();

app.get("/data", verifyToken, (req, res) =>
  res.status(200).json(req.user.name)
);

app.listen(process.env.PORT);

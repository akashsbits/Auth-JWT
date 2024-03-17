import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());

app.post("/login", (req, res) => {
  // Authenticate and get user from DB

  const user = { name: "Peter Griffin" };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  // Add Refresh Token into DB

  res.status(200).json({ accessToken, refreshToken });
});

app.post("/token", (req, res) => {
  const token = req.body.token;

  if (!token) return res.sendStatus(401);

  // Check Refresh Token in DB

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
    (err, user) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken({ name: user.name });

      res.status(200).json({ accessToken });
    }
  );
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

app.listen(process.env.AUTH_SERVER_PORT);

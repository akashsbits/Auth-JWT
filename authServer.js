import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/login", (req, res) => {
  // Authenticate and get user from DB

  const user = { name: "Peter Griffin" };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  // Add Refresh Token into DB

  // Send cookies to client containing access and refresh token
  res
    .status(200)
    .cookie("accessToken", accessToken, {
      maxAge: process.env.COOKIE_EXPIRY,
      //   secure: true, // the cookie is only sent over HTTPS
    })
    .cookie("refreshToken", refreshToken, {
      maxAge: process.env.COOKIE_EXPIRY,
      //   secure: true,
    })
    .json({ accessToken, refreshToken });
});

app.post("/token", (req, res) => {
  //   const token = req.body.token;
  const token = req.cookies.refreshToken;

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
      // Send cookie to client containing access token
      res
        .status(200)
        .cookie("accessToken", accessToken, {
          maxAge: process.env.COOKIE_EXPIRY,
          //   secure: true, // the cookie is only sent over HTTPS
        })
        .json({ accessToken });
    }
  );
});

app.delete("/logout", (req, res) => {
  // Delete Reference Token from DB

  // Delete cookies stored on client-side
  /* clearCookie does not send response and not close connection. 
  We must send back response, or the cookie won't be deleted. */
  res.status(204).clearCookie("accessToken").clearCookie("refreshToken").end();
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
}

app.listen(process.env.AUTH_SERVER_PORT);

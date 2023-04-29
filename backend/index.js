const express = require("express");
const axios = require("axios");
const app = express();
const cors = require('cors');
const path = require("path");
const uuid4 = require("uuid4");
const challenges = [];

// Middleware function to log request details
const logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode}`);
  next();
};

// Use the logRequest middleware for all requests
app.use(logRequest);
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/generate-challenge", (req, res) => {
  const token = uuid4();
  const { redirect } = req.query
  if (!redirect)
    return res.status(400).json({success: false, message: "No redirect URL"})
  // Construct the redirect URL with the token as a query parameter
  challenges.push({
    token: token,
    redirect: "https://google.com",
    verified: true,
  });

  res.json({
    success: true,
    token: token,
    challengeURL: `https://verify.skeltronix.xyz?token=${token}`,
  });
});

app.get("/redirect", (req, res) => {
  const { token } = req.query;
  const challenge = challenges.find((value, _, __) => value.token === token);
  if (!challenge) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid challenge" });
  }
  challenges.splice(challenges.indexOf(challenge), 1);
  if (!challenge.verified) {
    return res
      .status(400)
      .json({ success: false, message: "Challenge not verified" });
  }

  res.redirect(challenge.redirect)
});

app.post("/verify", async (req, res) => {
  const { response, token } = req.body;
  const challenge = challenges.find((value, _, __) => value.token === token);
  if (!challenge)
    return res
      .status(400)
      .json({ success: false, message: "Invalid challenge" });
  const secret = "0x98328286D2a0B5638974677f7edbd8956E3dF578";
  const sitekey = "029a6366-e8b0-4c1e-ae56-b9b232a2585a";

  try {
    const _response = await axios.post(
      "https://hcaptcha.com/siteverify",
      {
        secret: secret,
        response: response,
        sitekey: sitekey,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { success } = _response.data;
    if (success) {
      challenge.verified = true;
      res.status(200).json({ success: success, message: `https://verify.skeltronix.xyz/redirect?token=${challenge.token}` });
    } else {
      res
        .status(/*400*/ 200)
        .json({ success: success, message: "Captcha verification failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const PORT = 1337;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

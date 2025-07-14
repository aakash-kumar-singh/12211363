const express = require("express");
const router = express.Router();
const Link = require("../models/Link");
function createSlug(length = 7) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += characters[Math.floor(Math.random() * characters.length)];
  }
  return slug;
}
function calculateExpiry(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
router.post("/shorturls", async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }
  try {
    new URL(url); // validate format
  } catch {
    return res.status(400).json({ message: "Invalid URL format" });
  }
  let finalCode = shortcode;
  if (shortcode) {
    const validPattern = /^[a-zA-Z0-9]{4,20}$/;
    if (!validPattern.test(shortcode)) {
      return res
        .status(422)
        .json({ message: "Custom code must be 4–20 alphanumeric characters" });
    }

    const taken = await Link.findOne({ code: shortcode });
    if (taken) {
      return res
        .status(409)
        .json({ message: "That shortcode is already taken" });
    }
  } else {
    do {
      finalCode = createSlug();
    } while (await Link.findOne({ code: finalCode }));
  }
  const expiry = calculateExpiry(validity);
  const newEntry = new Link({
    code: finalCode,
    fullUrl: url,
    createdOn: new Date(),
    validTill: expiry,
  });
  await newEntry.save();
  res.status(201).json({
    shortenedUrl: `http://localhost:${process.env.PORT}/${finalCode}`,
    validTill: expiry.toISOString(),
  });
});
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const link = await Link.findOne({ code });
  if (!link) {
    return res.status(404).json({ message: "No link found" });
  }
  if (new Date() > link.validTill) {
    return res.status(410).json({ message: "This link has expired" });
  }
  link.clicks += 1;
  link.logs.push({
    referrer: req.get("referrer") || "Direct",
    location: "India",
    clickedAt: new Date(),
  });
  await link.save();
  res.redirect(link.fullUrl);
});
router.get("/shorturls/:code", async (req, res) => {
  const { code } = req.params;
  const data = await Link.findOne({ code });
  if (!data) {
    return res.status(404).json({ message: "Stats unavailable for this code" });
  }
  res.json({
    code: data.code,
    original: data.fullUrl,
    createdAt: data.createdOn,
    validTill: data.validTill,
    totalClicks: data.clicks,
    logs: data.logs,
  });
});
module.exports = router;

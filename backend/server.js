const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PRIVY_API_URL = "https://api.privy.io/v1";
const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

const auth = Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString("base64");

const headers = {
    "Content-Type": "application/json",
    "privy-app-id": PRIVY_APP_ID,
    Authorization: `Basic ${auth}`,
};

const data = {
    chain_type: "ethereum",
};

app.post("/create-wallet", async (req, res) => {
  try {
    const response = await axios.post(`${PRIVY_API_URL}/wallets`, data, { headers });
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.response.data });
  }
});

app.get("/get-all-wallets", async (req, res) => {
    try {
        const response = await axios.get(`${PRIVY_API_URL}/wallets`, { headers });
        console.log(response.data);
        res.json(response.data);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.response.data });
      }
})

app.get("/get-wallet-details/:walletId", async (req, res) => {
    const id = req.params.walletId;
    try {
        const response = await axios.get(`${PRIVY_API_URL}/wallets/${id}`, { headers });
        console.log(response.data);
        res.json(response.data);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.response.data });
      }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

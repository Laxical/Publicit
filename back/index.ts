import express, { Request, Response } from "express";
import dotenv from "dotenv";
import getAuthorizationSignature from "./AuthSign";
import { PrivyClient } from "@privy-io/server-auth";
import mongoose from "mongoose";
import Company from "./schema/companyschema";
import cors from "cors";

dotenv.config();
mongoose.connect(process.env.MONGO_URI || "");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID || "",
  process.env.PRIVY_APP_SECRET || "",
  {
    walletApi: {
      authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY,
    },
  }
);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

interface ClickRequestBody {
  userAddress: string;
  companyName: string;
  redirectUrl: string;
  product: string;
}

app.post("/api/track-click", async (req: Request<{}, {}, ClickRequestBody>, res: Response): Promise<void> => {
  try {
      const { userAddress, companyName, redirectUrl, product } = req.body;

      if (!userAddress) {
          res.status(400).json({ error: "User address is required" });
          return;
      }

      let company = await Company.findOne({ companyName: companyName });
      
      if (!company) {
        res.status(404).json({ error: "Company not found" });
        return;
      }
  
      const productData = company.products?.get(product);
  
      if (!productData) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
  
      if (productData.productUrl !== redirectUrl) {
        res.status(400).json({ error: "Redirect URL does not match the product URL" });
        return;
      }

      console.log(`User ${userAddress} clicked on ad (ID: ${companyName}, Product: ${product}, URL: ${redirectUrl}).`);

      res.json({ message: "Click tracked, incentive processed.", user: userAddress });
  } catch (error) {
      res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/create-wallet", async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName, product } = req.body;
    // companyName="fksad"
    // product="daknj"
    let company = await Company.findOne({ companyName });
    if (!company) {
      return res.status(404).json("company not found");
    }

    if (company && company.products && company.products.has(product)) {
      return res.status(400).json({
        message: `Wallet already exists for product "${product}".`,
        walletAddress: company.products.get(product),
      });
    }
    const authorizationSignature = getAuthorizationSignature({
      // Replace with your desired path, e.g. '/v1/wallets/<wallet_id>/rpc'
      url: "https://api.privy.io/v1/wallets",
      // Replace with your desired body
      body: { chain_type: "ethereum" },
    });
    const authorizationID = process.env.PRIVY_AUTHORIZATION_KEY_ID;
    const { id, address, chainType } = await privy.walletApi.create({
      chainType: "ethereum",
      authorizationKeyIds: [authorizationID],
    });
    console.log("Wallet created:", id, address, chainType);
    if (company && company.products) {
      company.products.set(product, { productUrl: "https://example.com/", walletUniqueId: id });
      await company.save();
    }

    // Return the newly created wallet info
    res.json({
      message: "Wallet created successfully!",
      walletAddress: address,
      companyName,
      product,
    });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ error: "Failed to create wallet" });
  }
});

app.post("/create-company", async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName } = req.body;
    console.log(companyName,"\n\n\n\n\n\n");

    // Check if the company already exists
    let company = await Company.findOne({ companyName });
    if (company) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Create a new company
    company = new Company({
      companyName,
      products: new Map(), // Initialize with an empty products map
    });

    await company.save(); // Save the company to the database

    return res.status(201).json({ message: "Company created successfully", company });
  } catch (error) {
    console.error("Error creating company:", error);
    return res.status(500).json({ error: "Failed to create company" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

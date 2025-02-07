"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_auth_1 = require("@privy-io/server-auth");
const mongoose_1 = __importDefault(require("mongoose"));
const companyschema_1 = __importDefault(require("./schema/companyschema"));
const cors_1 = __importDefault(require("cors"));
const policy_1 = __importDefault(require("./utils/policy"));
const createWallet_1 = __importDefault(require("./utils/createWallet"));
const sendTransaction_1 = __importDefault(require("./utils/sendTransaction"));
const axios_1 = __importDefault(require("axios"));
const multer_1 = __importDefault(require("multer"));
const updatePolicy_1 = __importDefault(require("./utils/updatePolicy"));
const upload = (0, multer_1.default)();
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGO_URI || "");
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});
const privy = new server_auth_1.PrivyClient(process.env.PRIVY_APP_ID || "", process.env.PRIVY_APP_SECRET || "", {
    walletApi: {
        authorizationPrivateKey: process.env.PRIVY_AUTHORIZATION_PRIVATE_KEY,
    },
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static("public"));
app.post("/api/track-click", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userAddress, companyName, redirectUrl, product } = req.body;
        if (!userAddress) {
            res.status(400).json({ error: "User address is required" });
            return;
        }
        let company = yield companyschema_1.default.findOne({ companyName: companyName });
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        const productData = (_a = company.products) === null || _a === void 0 ? void 0 : _a.get(product);
        if (!productData) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        if (productData.productUrl !== redirectUrl) {
            res.status(400).json({ error: "Redirect URL does not match the product URL" });
            return;
        }
        const userAdKey = `${userAddress}-${productData.walletUniqueId}`;
        yield (0, sendTransaction_1.default)(productData.walletUniqueId, {
            to: userAddress,
            value: 10000000000000000
        }, userAdKey);
        console.log(`User ${userAddress} clicked on ad (ID: ${companyName}, Product: ${product}, URL: ${redirectUrl}).`);
        res.json({ message: "Click tracked, incentive processed.", user: userAddress });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.post("/api/create-wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyName, product, productUrl, imageUrl, userReward, websiteCommission } = req.body;
        let company = yield companyschema_1.default.findOne({ companyName });
        if (!company) {
            return res.status(404).json("company not found");
        }
        if (company && company.products && company.products.has(product)) {
            return res.status(400).json({
                message: `Wallet already exists for product "${product}".`,
                walletAddress: company.products.get(product),
            });
        }
        const policyIds = yield (0, policy_1.default)();
        console.log("Policy ID:", policyIds);
        const wallet = yield (0, createWallet_1.default)(policyIds);
        if (!wallet) {
            throw new Error("Failed to create wallet");
        }
        const { id, address } = wallet;
        console.log("Wallet created:", id, address, companyName, product, productUrl);
        if (company && company.products) {
            company.products.set(product, { productUrl, walletUniqueId: id, policyId: policyIds, imageUrl, walletAddress: address, userReward, websiteCommission });
            yield company.save();
        }
        return res.status(200).json({ message: "Wallet created successfully!" });
    }
    catch (error) {
        console.error("Error creating wallet:", error);
        res.status(500).json({ error: "Failed to create wallet" });
    }
}));
app.post("/api/create-company", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyName } = req.body;
        // Check if the company already exists
        let company = yield companyschema_1.default.findOne({ companyName });
        if (company) {
            return res.status(400).json({ message: "Company already exists" });
        }
        // Create a new company
        company = new companyschema_1.default({
            companyName,
            products: new Map(), // Initialize with an empty products map
        });
        yield company.save(); // Save the company to the database
        return res.status(201).json({ message: "Company created successfully", company });
    }
    catch (error) {
        console.error("Error creating company:", error);
        return res.status(500).json({ error: "Failed to create company" });
    }
}));
app.get("/api/get-products/:companyName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyName } = req.params;
        console.log(companyName);
        let company = yield companyschema_1.default.findOne({ companyName }).lean();
        if (!company) {
            return res.status(400).json({ message: "Company doesn't exist" });
        }
        const filteredProducts = {};
        if (company.products) {
            for (const [key, product] of Object.entries(company.products)) {
                const { walletUniqueId, policyId } = product, filteredProduct = __rest(product, ["walletUniqueId", "policyId"]);
                filteredProducts[key] = filteredProduct;
            }
        }
        return res.status(200).json({
            message: "Products fetched successfully!",
            company: Object.assign(Object.assign({}, company), { products: filteredProducts })
        });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Failed to fetch products" });
    }
}));
app.get("/api/get-balance/:walletAddress", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { walletAddress } = req.params;
        const url = `https://api-sepolia.arbiscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${process.env.ARBISCAN_API_KEY}`;
        const response = yield axios_1.default.get(url);
        const data = response.data;
        if (data.status !== "1") {
            return res.status(400).json({ error: "Failed to fetch balance" });
        }
        const balanceInEth = (parseFloat(data.result) / 1e18).toString();
        return res.status(200).json({ address: walletAddress, balance: balanceInEth });
    }
    catch (error) {
        console.error("Error fetching balance:", error);
        return res.status(500).json({ error: "Failed to fetch balance" });
    }
}));
app.patch("/api/update-policy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { policyId } = req.body;
        yield (0, updatePolicy_1.default)(policyId);
        return res.status(200).json("updated successfully");
    }
    catch (error) {
        console.log("error", error);
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

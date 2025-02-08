"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const companySchema = new mongoose_1.default.Schema({
    companyName: { type: String, required: true },
    products: {
        type: Map,
        of: {
            walletAddress: { type: String, required: true },
            imageUrl: { type: String, required: true },
            productUrl: { type: String, required: true },
            walletUniqueId: { type: String, required: true },
            policyId: { type: String, required: true },
            userReward: { type: Number, required: true },
            websiteCommission: { type: Number, required: true },
        },
    },
});
const Company = mongoose_1.default.model('Company', companySchema);
exports.default = Company;

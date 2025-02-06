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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updatePolicy;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthSign_1 = __importDefault(require("./AuthSign"));
dotenv_1.default.config();
const DEFAULT_POLICY_UPDATE = {
    "method_rules": [{
            "method": "eth_sendTransaction",
            "rules": [{
                    "name": "Allowlist USDT",
                    "conditions": [
                        {
                            "field_source": "ethereum_transaction",
                            "field": "to",
                            "operator": "eq",
                            "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
                        },
                    ],
                    "action": "ALLOW"
                }],
        }],
    "default_action": "DENY"
};
function updatePolicy(policyId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Updating policy ${policyId}...`);
        const privyAppId = process.env.PRIVY_APP_ID;
        const privyAppSecret = process.env.PRIVY_APP_SECRET;
        if (!privyAppId || !privyAppSecret) {
            throw new Error('Missing required environment variables');
        }
        console.log("Privy App ID:", privyAppId);
        // Base64 encode for basic authentication
        const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
        const url = `https://api.privy.io/v1/policies/${policyId}`;
        // Prepare headers
        const headers = {
            'privy-app-id': privyAppId,
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'privy-authorization-signature': (0, AuthSign_1.default)({ url, body: DEFAULT_POLICY_UPDATE })
        };
        try {
            // Send the PATCH request
            const response = yield axios_1.default.patch(url, DEFAULT_POLICY_UPDATE, { headers });
            const updatedPolicy = response.data;
            console.log('Policy updated successfully!');
            console.log('Updated Policy:', JSON.stringify(updatedPolicy, null, 2));
            return updatedPolicy;
        }
        catch (error) {
            const errorMessage = error.message;
            console.error('Error updating policy:', errorMessage);
            throw error;
        }
    });
}

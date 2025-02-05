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
exports.default = postPolicy;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthSign_1 = __importDefault(require("./AuthSign"));
dotenv_1.default.config();
function postPolicy() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Creating policy...");
        const privyAppId = process.env.PRIVY_APP_ID;
        const privyAppSecret = process.env.PRIVY_APP_SECRET;
        console.log("Privy App ID:", privyAppId);
        // Base64 encode for basic authentication
        const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
        const url = 'https://api.privy.io/v1/policies';
        // Read policy from file
        const policyData = { "version": "1.0",
            "name": "T",
            "chain_type": "ethereum",
            "method_rules": [{
                    "method": "eth_sendTransaction",
                    "rules": [{
                            "name": "Restrict ETH transfers to a maximum value",
                            "conditions": [
                                {
                                    "field_source": "ethereum_transaction",
                                    "field": "value",
                                    "operator": "lte",
                                    "value": "500000000"
                                }
                            ],
                            "action": "ALLOW"
                        }]
                }],
            "default_action": "DENY"
        };
        // Prepare headers
        const headers = {
            'privy-app-id': privyAppId,
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'privy-authorization-signature': (0, AuthSign_1.default)({ url, body: policyData })
        };
        try {
            // Send the POST request
            const response = yield axios_1.default.post(url, policyData, { headers });
            const policy = response.data;
            console.log('Policy created successfully!');
            // console.log(`ID: ${policy.id}`);
            // console.log(`Name: ${policy.name}`);
            // console.log(`Version: ${policy.version}`);
            // console.log(`Chain Type: ${policy.chain_type}`);
            // console.log(`Default Action: ${policy.default_action}`);
            // Display method rules
            // policy.method_rules.forEach((rule: any, index: number) => {
            //     console.log(`Method Rule ${index + 1}:`);
            //     console.log(`Method: ${rule.method}`);
            //     rule.rules.forEach((ruleDetail: any, ruleIndex: number) => {
            //         console.log(`  Rule ${ruleIndex + 1}:`);
            //         console.log(`    Name: ${ruleDetail.name}`);
            //         console.log(`    Action: ${ruleDetail.action}`);
            //         ruleDetail.conditions.forEach((condition: any, conditionIndex: number) => {
            //             console.log(`      Condition ${conditionIndex + 1}:`);
            //             console.log(`        Field Source: ${condition.field_source}`);
            //             console.log(`        Field: ${condition.field}`);
            //             console.log(`        Operator: ${condition.operator}`);
            //             console.log(`        Value: ${condition.value}`);
            //         });
            //     });
            // });
            return policy.id;
        }
        catch (error) {
            const errorMessage = error.message;
            console.error('Error creating policy:', errorMessage);
            throw error;
        }
    });
}

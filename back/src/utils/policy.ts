import axios from "axios";
import * as fs from "fs";
import dotenv from 'dotenv';
import getAuthorizationSignature from "./AuthSign";
dotenv.config();


export default async function postPolicy() {
    console.log("Creating policy...");
    const privyAppId = process.env.PRIVY_APP_ID;
    const privyAppSecret = process.env.PRIVY_APP_SECRET;
    console.log("Privy App ID:", privyAppId);

    // Base64 encode for basic authentication
    const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');

    const url = 'https://api.privy.io/v1/policies';

    // Read policy from file
    const policyData = {"version": "1.0",
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
                        "value": "10000000000000000"
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
        'privy-authorization-signature': getAuthorizationSignature({url, body: policyData})
    };

    try {
        // Send the POST request
        const response = await axios.post(url, policyData, { headers });
        const policy = response.data;

        console.log('Policy created successfully!');

        return policy.id;
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error('Error creating policy:', errorMessage);
        throw error;
    }
}

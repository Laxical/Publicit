import axios from "axios";
import dotenv from 'dotenv';
import getAuthorizationSignature from "./AuthSign";

dotenv.config();

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
} ;

export default async function updatePolicy(policyId: string) {
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
        'privy-authorization-signature': getAuthorizationSignature({url, body: DEFAULT_POLICY_UPDATE})
    };
    
    try {
        // Send the PATCH request
        const response = await axios.patch(url, DEFAULT_POLICY_UPDATE, { headers });
        const updatedPolicy = response.data;
        console.log('Policy updated successfully!');
        console.log('Updated Policy:', JSON.stringify(updatedPolicy, null, 2));
        
        return updatedPolicy;
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error('Error updating policy:', errorMessage);
        throw error;
    }
}
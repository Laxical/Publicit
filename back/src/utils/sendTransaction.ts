import axios from "axios";
import dotenv from 'dotenv';
import getAuthorizationSignature from "./AuthSign";

dotenv.config();

interface TransactionParams {
  to: string;
  value: number;
}

interface TransactionResponse {
  method: string;
  data: {
    hash: string;
    caip2: string;
  };
}

export default async function sendEthTransaction(walletId: string, transaction: TransactionParams): Promise<TransactionResponse> {
  console.log("Starting transaction process...");
  
  const privyAppId = process.env.PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
  
  if (!privyAppId || !privyAppSecret) {
    throw new Error("Missing Privy credentials in environment variables");
  }

  const url = `https://api.privy.io/v1/wallets/${walletId}/rpc`;
  
  // Base64 encode for basic authentication
  const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');

  console.log("transaction value: ", transaction.value);

  const requestBody = {
    method: "eth_sendTransaction",
    caip2: "eip155:421614",
    params: {
      transaction: {
        to: transaction.to,
        value: transaction.value,
        chain_id: 421614  // Adding chain_id as specified in docs
      }
    }
  };

  console.log("Request payload:", JSON.stringify(requestBody, null, 2));

  const headers = {
    'privy-app-id': privyAppId,
    'Content-Type': 'application/json',
    'Authorization': authHeader,
    'privy-authorization-signature': getAuthorizationSignature({
      url,
      body: requestBody
    })
  };

  try {
    const response = await axios.post<TransactionResponse>(url, requestBody, { headers });
    console.log('Transaction sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
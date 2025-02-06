import axios from "axios";
import dotenv from 'dotenv';
import getAuthorizationSignature from "./AuthSign";
import { PrivyClient } from "@privy-io/server-auth";


dotenv.config();

interface TransactionParams {
  to: string;
  value: number;
}

interface TransactionResponse {
hash:string;
}


export default async function sendEthTransaction(id: string, transaction: TransactionParams): Promise<TransactionResponse> {

  console.log("Starting transaction process...");
//   console.log(id);
//   try{
  const privyAppId = process.env.PRIVY_APP_ID;
  const privyAppSecret = process.env.PRIVY_APP_SECRET;
//   if (!privyAppId || !privyAppSecret) {
//     throw new Error("Missing Privy credentials in environment variables");
//   }

//   const privy = new PrivyClient(privyAppId, privyAppSecret);


//   const data = await privy.walletApi.ethereum.sendTransaction({
//     walletId: id,
//     caip2: 'eip155:421614',
//     transaction: {
//       to: '0x487a30c88900098b765d76285c205c7c47582512',
//       value: 100000,
//       chainId: 421614,
//     },
//   });
//   console.log(data.hash)
  
// return { hash: data.hash };}
// catch(error){
//   console.log("error sending transaction", error);
//   return { hash: '' };
// }




  const url = `https://api.privy.io/v1/wallets/${id}/rpc`;
  
  // Base64 encode for basic authentication
  const authHeader = 'Basic ' + Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');

  console.log("transaction value: ", transaction.value);
  
  const valueInWei = "0x" + (transaction.value * 1e18).toString(16);
  const requestBody = {
    method: "eth_sendTransaction",
    caip2: "eip155:421614",
    params: {
      transaction: {
        to: transaction.to,
        value: valueInWei,
      }
    }
  };

  // console.log("Request payload:", JSON.stringify(requestBody, null, 2));

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
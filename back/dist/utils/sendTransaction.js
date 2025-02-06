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
exports.default = sendEthTransaction;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const AuthSign_1 = __importDefault(require("./AuthSign"));
dotenv_1.default.config();
function sendEthTransaction(id, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
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
            'privy-authorization-signature': (0, AuthSign_1.default)({
                url,
                body: requestBody
            })
        };
        try {
            const response = yield axios_1.default.post(url, requestBody, { headers });
            console.log('Transaction sent successfully!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.log(error);
            }
            else {
                console.error('Unexpected error:', error);
            }
            throw error;
        }
    });
}

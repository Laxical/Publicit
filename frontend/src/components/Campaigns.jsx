import { useState, useEffect } from "react"
import axios from "axios"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Copy, Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function CampaignCard({ productName, productData, balance, companyName, websiteAddress }) {
  const [isOpen, setIsOpen] = useState(false);

  const generateSnippet = (productName, productData) => {
    const htmlSnippet = `<script async src="http://localhost:3000/advertisement.js" 
  data-ad-image="${productData.imageUrl}" 
  data-ad-width="400px" 
  data-ad-height="350px" 
  data-ad-id="${companyName}" 
  redirect-url="${productData.productUrl}" 
  product="${productName}"
  website-wallet-address="${websiteAddress}"
>
</script>`;

    const reactSnippet = `import React, { useRef, useEffect } from "react";

const AdComponent = () => {
  const adRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
      if (!adRef.current || hasRun.current) return;
      hasRun.current = true;

      const script = document.createElement("script");
      script.src = "http://localhost:3000/advertisement.js";
      script.async = true;

      script.setAttribute("data-ad-image", "${productData.imageUrl}");
      script.setAttribute("data-ad-width", "400px");
      script.setAttribute("data-ad-height", "350px");
      script.setAttribute("data-ad-id", "${companyName}");
      script.setAttribute("redirect-url", "${productData.productUrl}");
      script.setAttribute("product", "${productName}");
      script.setAttribute("website-wallet-address", "${websiteAddress}");

      adRef.current.appendChild(script);
  }, []);

  return <div ref={adRef} id="ad-container"></div>;
};

export default AdComponent;`;

    return { htmlSnippet, reactSnippet };
  };

  const { htmlSnippet, reactSnippet } = generateSnippet(productName, productData);

  const copyToClipboard = (text, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert(message);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <span className="text-3xl mb-2 sm:mb-0">{productName}</span>
          <div className="text-sm font-normal flex flex-col sm:items-end">
            <div className="flex items-center mb-1">
              <span className="mr-2 font-semibold">Wallet:</span>
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {productData.walletAddress.slice(0, 6)}...{productData.walletAddress.slice(-4)}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(productData.walletAddress, "Wallet address copied!")}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy wallet address</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy wallet address</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <span className="mr-2 font-semibold">Balance:</span>
              <span className="font-medium">{balance !== undefined ? `${balance} ETH` : "Loading..."}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex ">
            <img
                src={productData.imageUrl || "/placeholder.svg"}
                alt={productName}
                className="rounded-md w-full h-auto"
                style={{ maxWidth: "400px", maxHeight: "350px" }}
            />
            <div className="p-4">
                <div><span className="font-bold">User incentives:</span> {productData.userReward}</div>
                <div><span className="font-bold">Website commision:</span> {productData.websiteCommission}</div>
                <div><span className="font-bold">Campaign Url:</span> {productData.productUrl}</div>
            </div>
        </div>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
        >
          {isOpen ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Hide Snippets
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show Snippets
            </>
          )}
        </Button>
        {isOpen && (
          <>
            <h3 className="text-lg font-medium mb-2">HTML Embed:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
              {htmlSnippet}
            </pre>
            <Button
              onClick={() => copyToClipboard(htmlSnippet)}
              className="mt-2 mb-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML Snippet
            </Button>

            <h3 className="text-lg font-medium mt-4 mb-2">React Embed:</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
              {reactSnippet}
            </pre>
            <Button
              onClick={() => copyToClipboard(reactSnippet)}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy React Snippet
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Campaigns() {
  const [companyName, setCompanyName] = useState("")
  const [websiteAddress, setWebsiteAddress] = useState("")
  const [products, setProducts] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [balances, setBalances] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setProducts(null)
    setBalances({})

    try {
      const response = await axios.get(`http://localhost:3000/api/get-products/${companyName}`)
      setProducts(response.data.company.products)
      console.log(response.data.company.products)
    } catch (error) {
      console.log(error)
      setError("Failed to fetch products. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (products) {
      Object.entries(products).forEach(([productName, productData]) => {
        getBalance(productData.walletAddress, productName)
      })
    }
  }, [products])

  const getBalance = async (walletAddress, productName) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/get-balance/${walletAddress}`)
      setBalances((prev) => ({ ...prev, [productName]: response.data.balance }))
    } catch (error) {
      console.log(error)
      setError("Failed to fetch balance. Please try again.")
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-3xl mx-auto shadow-lg mb-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-center">Campaign Display</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Enter your company name to view campaign snippets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Enter company name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteAddress">Your wallet address:</Label>
                <Input
                  type="text"
                  id="websiteAddress"
                  value={websiteAddress}
                  onChange={(e) => setWebsiteAddress(e.target.value)}
                  required
                  placeholder="Enter your wallet address"
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Campaigns...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {products && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Campaign Snippets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {Object.entries(products).map(([productName, productData]) => (
                <CampaignCard
                  key={productName}
                  productName={productName}
                  productData={productData}
                  balance={balances[productName]}
                  companyName={companyName}
                  websiteAddress={websiteAddress}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
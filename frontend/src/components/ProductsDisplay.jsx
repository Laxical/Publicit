import { useState, useEffect } from "react"
import axios from "axios"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Copy, Loader2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"




export default function ProductDisplay() {
  const [companyName, setCompanyName] = useState("")
  const [products, setProducts] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [balances, setBalances] = useState({})
  const [ethAmount, setEthAmount] = useState("")
  const backendapi=import.meta.env.VITE_BACKEND_API

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setProducts(null)
    setBalances({})

    try {
      const response = await axios.get(`${backendapi}/api/get-products/${companyName}`)
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
      const response = await axios.get(`${backendapi}/api/get-balance/${walletAddress}`)
      setBalances((prev) => ({ ...prev, [productName]: response.data.balance }))
    } catch (error) {
      console.log(error)
      setError("Failed to fetch balance. Please try again.")
    }
  }

  const addEthToWallet = async (recipientAddress) => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!")
      return
    }
  
    if (!ethAmount || isNaN(ethAmount) || parseFloat(ethAmount) <= 0) {
      alert("Please enter a valid amount of ETH!")
      return
    }
  
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" })
  
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
  
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(ethAmount),
      })
  
      alert("Transaction sent! Waiting for confirmation...")
  
      await tx.wait()
  
      alert("Transaction successful!")
      setEthAmount("")
    } catch (error) {
      console.error("Transaction failed:", error)
      setEthAmount("")
      alert(`Transaction failed!\nError: ${error.message}`)
    }
  }

  const copyToClipboard = (text, message = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert(message)
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }

  const generateSnippet = (productName, productData) => {
    const htmlSnippet = `<script async src="${backendapi}/advertisement.js" 
  data-ad-image="${productData.imageUrl}" 
  data-ad-width="400px" 
  data-ad-height="350px" 
  data-ad-id="${companyName}" 
  redirect-url="${productData.productUrl}" 
  product="${productName}"
  website-wallet-address="<website's-wallet-address>"
>
</script>`

    const reactSnippet = `import { useRef, useEffect } from "react";

const AdComponent = () => {
  const adRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
      if (!adRef.current || hasRun.current) return;
      hasRun.current = true;

      const script = document.createElement("script");
      script.src = "${backendapi}/advertisement.js";
      script.async = true;

      script.setAttribute("data-ad-image", "${productData.imageUrl}");
      script.setAttribute("data-ad-width", "400px");
      script.setAttribute("data-ad-height", "350px");
      script.setAttribute("data-ad-id", "${companyName}");
      script.setAttribute("redirect-url", "${productData.productUrl}");
      script.setAttribute("product", "${productName}");
      script.setAttribute("website-wallet-address", "<website's-wallet-address>");

      adRef.current.appendChild(script);
  }, []);

  return <div ref={adRef} id="ad-container"></div>;
};

export default AdComponent;`

    return { htmlSnippet, reactSnippet }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full shadow-lg">
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

            {products && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold mb-2">Embedded Link Snippets:</h2>
                {Object.entries(products).map(([productName, productData]) => {
                  const { htmlSnippet, reactSnippet } = generateSnippet(productName, productData)

                  return (
                    <Card key={productName} className="overflow-hidden">
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
                                      onClick={() =>
                                        copyToClipboard(productData.walletAddress, "Wallet address copied!")
                                      }
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
                              <span className="font-medium">
                                {balances[productName] !== undefined ? `${balances[productName]} ETH` : "Loading..."}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Input
                                        type="number"
                                        placeholder="Enter ETH amount"
                                        value={ethAmount}
                                        onChange={(e) => setEthAmount(e.target.value)}
                                        className="w-24"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addEthToWallet(productData.walletAddress)}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add ETH
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Add ETH to this wallet</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h3 className="text-lg font-medium mb-2">HTML Embed:</h3>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                          {htmlSnippet}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(htmlSnippet)}
                          className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105"
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
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}


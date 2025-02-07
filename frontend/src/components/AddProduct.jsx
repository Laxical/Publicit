"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

export default function AddProduct() {
  const [companyName, setCompanyName] = useState("")
  const [productName, setProductName] = useState("")
  const [productUrl, setProductUrl] = useState("")
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)
  const [userReward,setUserReward]=useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [websiteCommission,setWebsiteCommission]=useState(0);
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const imageUrl = await handleImageUpload()
      const response = await axios.post("http://localhost:3000/api/create-wallet", {
        companyName,
        product: productName,
        productUrl,
        imageUrl,
        userReward,
        websiteCommission
      })
      setMessage(response.data.message)
      if (response.data.walletAddress) {
        setCompanyName("")
        setProductName("")
        setProductUrl("")
        setFile(null)
        setUserReward(0);
      }
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred while adding the product.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async () => {
    if (!file) return null

    const uploadPreset = "hackathonform"
    const cloudName = "dgjqg72wo"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: false,
        }
      )
      return response.data.secure_url
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error.message)
      setError("Failed to upload image. Please try again.")
      return null
    }
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight text-center">Add campaign</CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Fill in the details below to add your campaign to our marketplace.
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
                  placeholder="Enter your company name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productName">campaign Name</Label>
                <Input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  placeholder="Enter your product name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="UserReward">User Reward</Label>
                <Input
                  type="text"
                  id="=userReward"
                  value={userReward}
                  onChange={(e) => setUserReward(e.target.value)}
                  required
                  placeholder="Enter Maximum User Reward"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteCommission">website commission</Label>
                <Input
                  type="text"
                  id="=websiteCommission"
                  value={websiteCommission}
                  onChange={(e) => setWebsiteCommission(e.target.value)}
                  required
                  placeholder="Enter website commission"
                  className="w-full"
                />
              </div>





              <div className="space-y-2">
                <Label htmlFor="productUrl">campaign URL</Label>
                <Input
                  type="url"
                  id="productUrl"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  required
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUpload">campaign Image</Label>
                <div className="mt-1 flex items-center gap-4">
                  <Input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding campaign...
                  </>
                ) : (
                  "Add campaign"
                )}
              </Button>
            </form>

            {message && (
              <Alert className="mt-6 bg-green-50 border-green-200 text-green-800">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

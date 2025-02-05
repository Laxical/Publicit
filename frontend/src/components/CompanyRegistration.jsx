import { useState } from "react"
import axios from "axios"

function CompanyRegistration() {
    const [companyName, setCompanyName] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            console.log("Company Name: ", companyName);
            const response = await axios.post("http://localhost:3000/api/create-company", { companyName })
            setMessage(response.data.message)
        if (response.data.company) {
            setCompanyName("")
        }
        } catch (error) {
            setMessage(error.response?.data?.error || "An error occurred")
        }
    }

    return (
        <div>
        <h1 className="text-2xl font-bold mb-4">Register Company</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                </label>
                <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
                Register Company
            </button>
        </form>
        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
        </div>
    )
}

export default CompanyRegistration


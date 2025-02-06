import React, { useState } from "react";
import axios from "axios";

function ProductDisplay() {
  const [companyName, setCompanyName] = useState("");
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3000/api/get-products/${companyName}`);
      setProducts(response.data.company.products);
      console.log(response.data.company.products);
      setError("");
    } catch (error) {
      console.log(error);
      setError("Failed to fetch products. Please try again.");
      setProducts(null);
    }
  };

  const generateSnippet = (productName, productData) => {
    return `<script async src="http://localhost:3000/advertisement.js" data-ad-image="${productData.imageUrl}" data-ad-width="400px" data-ad-height="350px" data-ad-id="${companyName}" redirect-url="${productData.productUrl}" product="${productName}"></script>`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Snippet copied to clipboard!");
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Display</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter company name"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {products && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Embedded Link Snippets:</h2>
          {Object.entries(products).map(([productName, productData]) => (
            <div key={productName} className="mb-4 p-4 border rounded">
              <h3 className="font-bold">{productName}</h3>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                {generateSnippet(productName, productData)}
              </pre>
              <button
                onClick={() => copyToClipboard(generateSnippet(productName, productData))}
                className="mt-2 bg-green-500 text-white p-2 rounded"
              >
                Copy Snippet
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductDisplay;

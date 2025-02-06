import { useEffect, useState } from 'react';
import {usePrivy} from '@privy-io/react-auth';
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom"
import CompanyRegistration from "./components/CompanyRegistration"
import AddProduct from "./components/AddProduct"
import Home from "./components/Home"
import ProductDisplay from './components/ProductsDisplay';
import LandingPage from './components/landingPage';
import { Header } from './components/c/header';

const App = () => {
  const { user } = usePrivy();
  const [smartWallet, setSmartWallet] = useState(null);

  return (
    <Router>
      {/* <div className="App">
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/register-company" className="hover:underline">
                Register Company
              </Link>
            </li>
            <li>
              <Link to="/add-product" className="hover:underline">
                Add Product
              </Link>
            </li>
            <li>
              <Link to="/product-display" className="hover:underline">Product Display</Link>
            </li>
          </ul>
        </nav> */}
        <Header/>

        <main>
          <Routes>
            <Route path="/register-company" element={<CompanyRegistration />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/product-display" element={<ProductDisplay />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </main>
        
      {/* </div> */}
    </Router>
  )
}

export default App
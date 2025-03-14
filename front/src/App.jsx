import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/Home";
import ProductDetails from "./pages/productdetails.jsx";

function App() {
    return (
        <Router>
            {/* Navigation Bar */}
            <nav className="bg-[#0C0C0E] text-white py-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center px-6">
                <h1 className="font-bold  text-3xl">Smart Electronics</h1>
                    <div className="space-x-6">
                        <Link to="/" className="hover:underline">Home</Link>
                        <Link to="/login" className="hover:underline">Login</Link>
                        <Link to="/register" className="hover:underline">Register</Link>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
                        <p className="text-gray-600">Please <Link to="/login" className="font-bold hover:underline">Login</Link> or  <Link to="/register" className="font-bold hover:underline">Register</Link> to continue.</p>
                    </div>
                } />
                <Route path="/detail" element={<ProductDetails />} />
            </Routes>
        </Router>
    );
}

export default App;

// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import { loginUser } from "../api/api";
import { setUser, logout } from "../redux/user/userSlice";
import { setCartFromBackend, clearCart } from "../redux/cartSlice";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔄 Clear old session before login
      dispatch(logout());
      dispatch(clearCart());

      const response = await loginUser(credentials);

      if (response.message === "Login successful") {
        const user = response.user;
        dispatch(setUser(user)); // ✅ Save user to Redux and localStorage

        // 🛒 Fetch user-specific cart from backend
        const cartRes = await axios.get(
          `http://localhost:8085/cart/view?userId=${user.id}`
        );

        const fullCart = await Promise.all(
          cartRes.data.map(async (item) => {
            const productRes = await axios.get(
              `http://localhost:8085/products/${item.productId}`
            );
            return {
              product: productRes.data,
              quantity: item.quantity,
            };
          })
        );

        dispatch(setCartFromBackend(fullCart)); // ✅ Save cart to Redux and localStorage

        navigate("/");
      } else {
        setErrorMessage(response.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex border-t-1 border-white items-center justify-center min-h-screen w-full bg-gradient-to-b from-black to-purple-900">
      <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-lg shadow-black/40 w-96 border border-white/20">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/20 text-white placeholder-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/20 text-white placeholder-white"
          />
          {errorMessage && (
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-1/2 mt-2 mx-auto block bg-purple-800 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-300 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

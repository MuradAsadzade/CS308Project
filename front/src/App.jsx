import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { useEffect } from "react";
import axios from "axios";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import ShoppingCart from "./pages/ShoppingCart";

import { clearCart } from "./redux/cartSlice";


import { logout } from "./redux/user/userSlice";
import { setCartFromBackend } from "./redux/cartSlice"; // ✅ make sure this exists

function App() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();


  // Load cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser?.id) return;

      try {
        const response = await axios.get(`http://localhost:8085/cart/view`, {
          params: { userId: currentUser.id }
        });

        const cartItems = await Promise.all(
          response.data.map(async (item) => {
            const productRes = await axios.get(`http://localhost:8085/products/${item.productId}`);
            return {
              product: productRes.data,
              quantity: item.quantity
            };
          })
        );

        dispatch(setCartFromBackend(cartItems));
      } catch (err) {
        console.error("Error loading cart from backend:", err);
      }
    };

    fetchCart();
  }, [currentUser, dispatch]);

  const handleLogout = () => {
    dispatch(clearCart());       // clear cart from Redux + localStorage
    dispatch(logout());          // reset user state
    window.location.href = "/login"; // ✅ safely redirect
  };

  return (
    <Router>
      <nav className="bg-[#0C0C0E] text-white py-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="font-bold text-3xl">Smart Electronics</h1>
          <div className="space-x-6 flex items-center">
            <Link to="/cart">Cart</Link>
            <Link to="/">Home</Link>
            <span>
              Logged in as:{" "}
              {currentUser?.username ? currentUser.username : "Guest"}
            </span>
            {currentUser?.username && currentUser.username !== "Guest" ? (
              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/register" className="hover:underline">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<ShoppingCart />} />
      </Routes>
    </Router>
  );
}

export default App;

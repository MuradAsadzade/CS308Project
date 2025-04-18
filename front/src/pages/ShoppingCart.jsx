import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { clearCart, removeFromCart } from "../redux/cartSlice";
import { removeFromBackendCart, clearBackendCart } from "../api/api";

function ShoppingCart() {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const totalPrice = cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
  );

  const handleRemove = async (productId) => {
    dispatch(removeFromCart(productId));
    if (currentUser?.id) {
      try {
        await removeFromBackendCart(currentUser.id, productId);
      } catch (error) {
        console.error("Failed to remove item from backend:", error);
      }
    }
  };

  const handleClearCart = async () => {
    if (currentUser?.id) {
      try {
        await clearBackendCart(currentUser.id); // clear backend
      } catch (err) {
        console.error("Failed to clear cart on backend:", err);
      }
    }
    dispatch(clearCart()); // clear frontend regardless
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 p-6 text-white">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="bg-white text-black p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
          {cartItems.length === 0 ? (
              <div className="text-center">
                <p className="text-lg">Your cart is currently empty.</p>
                <p className="text-sm text-gray-500 mt-1">
                  Browse products and add them to your cart.
                </p>
              </div>
          ) : (
              <>
                {cartItems.map((item, index) => (
                    <div
                        key={index}
                        className="border-b py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <button
                            onClick={() => handleRemove(item.product.id)}
                            className="text-red-500 text-sm hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="font-semibold">
                        ${ (item.product.price * item.quantity).toFixed(2) }
                      </p>
                    </div>
                ))}

                <div className="mt-4 text-right font-bold text-lg">
                  Total: ${totalPrice.toFixed(2)}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                      onClick={handleClearCart}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition cursor-pointer"
                  >
                    Clear Cart
                  </button>
                  <Link to="/checkout">
                  <button className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded shadow hover:brightness-105 transition cursor-pointer">
                    Proceed to Checkout
                  </button>
                  </Link>
                </div>
              </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
  );
}

export default ShoppingCart;

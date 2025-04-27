import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../redux/cartSlice";
import { addToBackendCart } from "../api/api";

import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice";

// Example images imports...
import iphone16Image from "../img/iphone16image.webp";
import iphone16Thumb1 from "../img/iphone16image.webp";
import iphone16Thumb2 from "../img/iphone16image.webp";
import iphone16Thumb3 from "../img/iphone16image.webp";
import otherProduct1 from "../img/iphone16image.webp";
import otherProduct2 from "../img/iphone16image.webp";
import otherProduct3 from "../img/iphone16image.webp";
import otherProduct4 from "../img/iphone16image.webp";

const Productdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const buildImgSrc = (raw) => {
    // fallback placeholder in case the product has no image
    if (!raw) return "/products_images/default_product_image.png";
    // ^ put that file in front/public/products_images if you don't have one yet

    // raw already contains "http://…" → leave it
    if (raw.startsWith("http")) return raw;

    // otherwise it's a relative path like "/products_images/iphone15.jpg"
    // We want the React dev‑server to serve it, so return it untouched
    return raw;
  };

  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  // State definitions
  const [productData, setProductData] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [installment, setInstallment] = useState("3");
  // Use an array state so multiple accordion sections can be toggled independently.
  const [openIndexes, setOpenIndexes] = useState([]);
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: "" });
  const [otherProducts, setOtherProducts] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        /* ── 1. load the current product & its comments in parallel ── */
        const [productRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:8085/products/${id}`),
          axios.get(`http://localhost:8085/comments/product/${id}`)
        ]);

        const current = productRes.data;
        setProductData(current);
        setComments(commentsRes.data);

        /* ── 2. fetch all products, pick 4 others from the same category ── */
        const allRes = await axios.get("http://localhost:8085/products/all");
        const similar = allRes.data
          .filter(p => p.category === current.category && p.id !== current.id)
          .slice(0, 4);                     // keep only four

        setOtherProducts(similar);
      } catch (err) {
        console.error("Error fetching product‑details data:", err);
      }
    };

    fetchData();
  }, [id]);


  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchWishlist(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  if (!productData) {
    return (
      <div className="text-center p-10 text-white">
        Loading product details...
      </div>
    );
  }

  const isInWishlist = wishlistItems.some(
    (w) => w.product.id === productData?.id
  );

  // Handle "Add to Cart" and then navigate to the cart page
  const handleAddToCart = async () => {
    dispatch(addToCart({ product: productData, quantity }));
    try {
      const response = await addToBackendCart(
        currentUser?.username || currentUser?.email,
        productData.name,
        quantity
      );
      console.log("Added to backend cart:", response);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!currentUser?.id || !productData?.id) return;

    if (isInWishlist) {
      await dispatch(
        removeFromWishlist({
          userId: currentUser.id,
          productId: productData.id,
        })
      ).unwrap();
    } else {
      await dispatch(
        addToWishlist({
          userId: currentUser.id,
          productId: productData.id,
        })
      ).unwrap();
    }
  };

  const handleBuyNow = () => {
    // optional: also add the item to cart first
    dispatch(addToCart({ product: productData, quantity }));
    navigate("/checkout");
  };

  const totalPrice = productData.price * quantity;
  const monthlyInstallment = totalPrice / Math.max(parseInt(installment, 10), 1);


  // Define accordion sections
  const accordionSections = [
    {
      title: "Product Details",
      content: (
        <div className="text-sm text-gray-300 space-y-2">
          <p>{productData.description || "No description available."}</p>
        </div>
      ),
    },
    {
      title: "Technical Specifications",
      content: (
        <div className="text-sm text-gray-300 grid grid-cols-2 gap-y-2 gap-x-4">
          <div className="font-medium">Model</div>
          <div>{productData.model}</div>
          <div className="font-medium">Serial Number</div>
          <div>{productData.serialNumber}</div>
          <div className="font-medium">Quantity Available</div>
          <div>{productData.quantity}</div>
          <div className="font-medium">Warranty</div>
          <div>{productData.warrantyStatus}</div>
          <div className="font-medium">Distributor Info</div>
          <div>{productData.distributorInfo}</div>
        </div>
      ),
    },
    {
      title: "Promotions",
      content: (
        <div className="text-sm text-gray-300">
          <p>Details about current promotions will be available here.</p>
        </div>
      ),
    },
    {
      title: "Shipping & Return Policy",
      content: (
        <div className="text-sm text-gray-300">
          <p>Free shipping and 14-day returns available.</p>
          <p>Please contact customer support for more details.</p>
        </div>
      ),
    },
    {
      title: "Payment Options",
      content: (
        <div className="text-sm text-gray-300">
          <p>
            Payment options include credit card, bank transfer, cash on delivery,
            and installment plans.
          </p>
          <p>For more details, please proceed to the payment page.</p>
        </div>
      ),
    },
    {
      title: "Product Reviews",
      content: (
        <div className="text-sm text-gray-300">
          <p>No reviews yet. (Or show your own logic here.)</p>
        </div>
      ),
    },
  ];

  // Toggle an accordion section independently
  const toggleAccordion = (index) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };



  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;
    try {
      const userId = currentUser?.id;
      const productId = productData.id;
      const response = await axios.post("http://localhost:8085/comments/add", null, {
        params: { userId, productId, text: newComment, rating: 5 },
      });
      const savedComment = response.data;
      setComments((prevComments) => [
        ...prevComments,
        { user: { username: currentUser?.username || "Anonymous" }, text: savedComment.text },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  // Check if the current user already submitted a review
  const hasReviewed = reviews.some((review) => review.user === currentUser?.username);

  const handleReviewSubmit = () => {
    if (hasReviewed) {
      alert("You have already submitted a review.");
      return;
    }
    const newEntry = {
      rating: newReview.rating,
      user: currentUser?.username || "Anonymous",
      text: newReview.text || "",
    };
    setReviews([...reviews, newEntry]);
    alert("Review submitted!");
    setNewReview({ rating: 5, text: "" });
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    // Allow the user to type freely, but only accept non-negative integers
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleQuantityBlur = () => {
    let parsedQuantity = parseInt(quantity, 10);

    // If the quantity is invalid or less than 1, set it to 1
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      parsedQuantity = 1;
    }

    // If the quantity exceeds the stock, set it to the stock limit
    if (parsedQuantity > productData.quantity) {
      parsedQuantity = productData.quantity;
    }

    // Update the state with the validated quantity
    setQuantity(parsedQuantity);
  };




  return (
    <div className="border-t-1 border-white max-w-screen-xl mx-auto p-4 bg-gradient-to-b from-black to-purple-900">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-white flex items-center space-x-2">
        <Link to="/" className="hover:underline cursor-pointer">Home</Link>
        <span className="cursor-pointer hover:underline">&raquo;</span>
        <Link to="/smartphones" className="hover:underline cursor-pointer">Smartphones</Link>
        <span className="cursor-pointer hover:underline">&raquo;</span>
        <span className="cursor-pointer hover:underline">{productData.name}</span>
      </nav>

      {/* Main card */}
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg">
        {/* left thumbnails */}
        <div className="flex-shrink-0 w-full md:w-96">
          <div className="flex space-x-2 mb-4">
            <img src={buildImgSrc(productData.imageUrl)} alt="Thumbnail 1" className="w-16 h-16 border rounded" />
            <img src={buildImgSrc(productData.imageUrl)} alt="Thumbnail 2" className="w-16 h-16 border rounded" />
            <img src={buildImgSrc(productData.imageUrl)} alt="Thumbnail 3" className="w-16 h-16 border rounded" />
          </div>
          <img src={productData.imageUrl} alt={productData.name}
            className="w-full h-auto border border-gray-200 rounded" />
        </div>

        {/* right info */}
        <div className="flex-1 flex flex-col justify-between">
          {/* title + wishlist */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {productData.name}
            </h1>
            <button onClick={toggleWishlist} className="focus:outline-none">
              <span
                className={
                  "text-5xl leading-none transition-transform hover:scale-110 " +
                  (isInWishlist
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                    : "text-gray-300 cursor-pointer")
                }>
                {isInWishlist ? "♥" : "♡"}
              </span>
            </button>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-black">${productData.price}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              Distributor: <span className="font-medium">{productData.distributorInfo || "Unknown"}</span>
            </p>
            <p className="text-sm text-gray-700">
              Warranty: <span className="font-medium">{productData.warrantyStatus}</span>
            </p>
            <p className="text-sm text-gray-700">
              In Stock: <span className="font-medium">{productData.quantity}</span>
            </p>
          </div>

          <input
            type="number"
            id="quantity"
            min="1"
            max={productData.quantity}
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            className="w-16 px-2 py-1 border rounded-md"
          />


          <div className="flex items-center space-x-2 mb-4">
            <label htmlFor="installment" className="font-medium">Installments:</label>
            <select
              id="installment"
              value={installment}
              onChange={(e) => setInstallment(e.target.value)}
              className="border rounded px-2 py-1 cursor-pointer"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
            <span className="font-bold text-gray-600">${monthlyInstallment.toFixed(2)} / month</span>
          </div>
          <div className="text-lg font-bold mb-4">Total: ${totalPrice.toFixed(2)}</div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="bg-gradient-to-b from-black to-purple-900 text-white font-semibold px-6 py-2 rounded transition cursor-pointer hover:scale-105 hover:brightness-110"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-gradient-to-b from-purple-500 to-purple-700 text-white font-semibold px-6 py-2 rounded shadow hover:scale-105 hover:brightness-110 transition cursor-pointer">
              Buy Now
            </button>

          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="mt-8 border-t border-gray-300 pt-2">
        {accordionSections.map((section, index) => (
          <div key={index} className="border-b border-gray-200 mb-2">
            <button
              className="cursor-pointer w-full text-left py-2 px-2 flex items-center justify-between focus:outline-none"
              onClick={() => toggleAccordion(index)}
            >
              <span className="font-medium text-white">{section.title}</span>
              <span className="text-white">
                <svg
                  className={`h-4 w-4 transform transition-transform duration-200 ${openIndexes.includes(index) ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
            <div className={`px-4 pb-4 overflow-hidden transition-all ease-in-out duration-300 ${openIndexes.includes(index) ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Other Products (Static) */}
      <div className="mt-8">
        <h2 className="text-lg text-white font-semibold mb-4">Other Products Viewed</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {otherProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[120px] flex flex-col items-center border border-white rounded p-2 transition-transform translate-x-1 translate-y-1 duration-200 hover:scale-105 cursor-pointer"
            >
              <img
                src={buildImgSrc(product.image_url || product.imageUrl)}   // <‑‑ updated line
                alt={product.name}
                className="w-24 h-24 object-cover mb-2"
              />
              <p className="text-sm text-white">{product.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews & Comments Section */}
      <div className="mt-8 border-t border-gray-300 pt-4 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Customer Reviews & Comments</h2>

        {/* Reviews Section */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4 text-green-700">Leave a Review</h3>
          {reviews.some((r) => r.user === currentUser?.username) ? (
            <p className="text-yellow-300 mb-4">✅ You have already submitted a review.</p>
          ) : (
            <div className="flex flex-col space-y-2 mb-6">
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
                className="border border-gray-300 p-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} Stars
                  </option>
                ))}
              </select>
              <textarea
                className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Write your review here..."
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              />
              <button
                onClick={handleReviewSubmit}
                className="self-start bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md text-white">
                Average Rating:{" "}
                <span className="text-yellow-400 font-bold">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>{" "}
                / 5
              </h4>
              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) ? "text-yellow-400" : "text-gray-500"}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-green-700">{review.user}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.text && <p className="text-gray-800">{review.text}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-700">Customer Comments</h3>
          <div className="flex flex-col space-y-2 mb-4">
            <textarea
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Write your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleCommentSubmit}
              className="self-start bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition cursor-pointer"
            >
              Submit Comment
            </button>
          </div>
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 rounded-lg shadow-sm border-l-4 border-purple-500"
                >
                  <p className="font-semibold text-purple-700 mb-1">{comment.user.username}:</p>
                  <p className="text-gray-800">comment: {comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Productdetails;
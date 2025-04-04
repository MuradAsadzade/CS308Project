import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BannerCarousel from "../components/BannerCarousel"; // or your own banner
import puzzleImage from "../img/puzzle.jpeg";
import vacuumCleanerImage from "../img/vacuumcleaner.jpeg";
import disneyImage from "../img/disney.jpeg";
import stormImage from "../img/stormtrooper.jpeg";

// Define categories (if needed)
const categories = [
  { name: "Smartfon və aksesuarlar", icon: "📱" },
  { name: "Böyük Məişət texnikası", icon: "🚛" },
  { name: "Kiçik Məişət Texnikası", icon: "☕" },
  { name: "TV, Audio, Foto texnika", icon: "📺", active: true },
  { name: "Smart saat və Qulaqlıqlar", icon: "⌚" },
  { name: "Kompüter və Ofis avadanlıqları", icon: "💻" },
  { name: "Mebel və Tekstil", icon: "🛋" },
  { name: "İkinci əl məhsullar", icon: "🔄" },
  { name: "Oyun konsolları və aksesuarları", icon: "🎮" },
  { name: "Şəxsi qulluq və Gözəllik", icon: "💄" },
  { name: "Ev və mətbəx əşyaları", icon: "🏠" },
];

// Define newProducts array with unique IDs
const newProducts = [
  {
    category: "Yeni Məhsullar",
    items: [
      {
        id: "1",
        name: "Puzzle Assassin's Creed Valhalla",
        price: 39,
        oldPrice: 49,
        image: puzzleImage,
      },
      {
        id: "2",
        name: "Beko B50 C 890 A TV & Vacuum Cleaner",
        price: 1115,
        oldPrice: 1200,
        image: vacuumCleanerImage,
      },
      {
        id: "3",
        name: "Funko-POP Disney: Donald Duck",
        price: 39,
        oldPrice: 59,
        image: disneyImage,
      },
      {
        id: "4",
        name: "Funko-POP Star Wars: Stormtrooper",
        price: 39,
        oldPrice: 59,
        image: stormImage,
      },
    ],
  },
];

const AllProducts = [
  {
    // placeholder
  },
];

const Sidebar = () => (
  <aside className="w-80 bg-white p-4 shadow-md rounded-lg">
    <ul className="space-y-2 m-5">
      {categories.map((cat, index) => (
        <li
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all 
            ${
              cat.active
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-200"
            }`}
        >
          <span className="text-lg">{cat.icon}</span>
          <span className="text-sm">{cat.name}</span>
        </li>
      ))}
    </ul>
  </aside>
);

const Banner = () => (
  <div className="flex-1 bg-gray-200 p-8 text-center">
    <h2 className="text-2xl font-bold">Smart alış-verişə hazır ol!</h2>
    <p className="text-xl">GEEPAS MƏHSULLARI</p>
    <div className="text-4xl font-bold my-4">
      111 AZN <span className="text-lg">aylıq</span>
    </div>
    <img src="geepas_banner.png" alt="Geepas Products" className="mx-auto" />
  </div>
);

const ProductCard = ({ product }) => (
  <div className="border p-4 rounded-2xl shadow-lg w-72 bg-white transition-transform transform hover:scale-105 hover:shadow-xl">
    <div className="relative w-full h-44">
      <img
        src={product.image ? product.image : "default_product_image.png"}
        alt={product.name}
        className="w-full h-full object-cover rounded-xl"
      />
      {product.oldPrice && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
          Endirim!
        </span>
      )}
    </div>
    <h3 className="font-semibold mt-3 text-gray-800 text-lg">
      {product.name}
    </h3>
    <p className="text-xl font-bold text-red-500 mt-1">{product.price} AZN</p>

    {/* “View” or “Buy” button leads to Productdetails page at /product/:id */}
    <Link to={`/product/${product.id}`}>
      <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-lg text-lg font-semibold transition hover:opacity-90">
        Bir kliklə al
      </button>
    </Link>
  </div>
);

const NewProductsSection = () => {
  const [activeTab, setActiveTab] = useState("All Products");

  return (
    <div className="mt-8 p-10 bg-gray-100 rounded-xl">
      <div className="flex space-x-6 border-b pb-3">
        {["All Products", "Yeni Məhsullar", "Ən çox satılan", "Outlet", "Kampaniyalar"].map(
          (tab) => (
            <button
              key={tab}
              className={`text-lg font-bold pb-2 mr-20 transition ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>
      <div className="grid grid-cols-4 gap-6 mt-6">
        {newProducts
          .find((section) => section.category === activeTab)
          ?.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
      <div className="grid grid-cols-4 gap-6 mt-6">
        {AllProducts.find((section) => section.category === activeTab)?.items?.map(
          (product) => (
            <ProductCard key={product.id} product={product} />
          )
        )}
      </div>
    </div>
  );
};

const BackendProductsSection = () => {
  const [backendProducts, setBackendProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8085/products/all")
      .then((response) => {
        setBackendProducts(response.data);
      })
      .catch((error) => console.error("Error fetching backend products:", error));
  }, []);

  return (
    <div className="mt-8 p-10 bg-gray-100 rounded-xl">
      <h2 className="text-lg font-semibold mb-4">Backend Products</h2>
      <div className="grid grid-cols-4 gap-6 mt-6">
        {backendProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="border-t-1 border-white p-10 bg-gradient-to-b from-black to-purple-900">
      {/* Example: Button to go to Cart near top */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Go to Shopping Cart
        </Link>
      </div>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          {/* If you have a BannerCarousel, use it. Otherwise the sample Banner */}
          <BannerCarousel />
        </div>
      </div>
      <NewProductsSection />
      <BackendProductsSection />
    </div>
  );
};

export default Home;
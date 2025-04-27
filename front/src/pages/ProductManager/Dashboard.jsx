// Dashboard.jsx
import { Link } from "react-router-dom";

export default function ProductManagerDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Product Manager Dashboard</h1>
      <ul className="space-y-4">
        <li><Link to="/pm/products" className="text-blue-600">Manage Products</Link></li>
        <li><Link to="/pm/categories" className="text-blue-600">Manage Categories</Link></li>
        <li><Link to="/pm/stock" className="text-blue-600">Manage Stock</Link></li>
        <li><Link to="/pm/delivery" className="text-blue-600">Delivery List</Link></li>
        <li><Link to="/pm/orders" className="text-blue-600">Update Order Status</Link></li>
        <li><Link to="/pm/comments" className="text-blue-600">Moderate Comments</Link></li>
      </ul>
    </div>
  );
}

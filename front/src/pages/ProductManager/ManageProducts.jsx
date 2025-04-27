import ProductForm from "../../components/ProductManager/ProductForm";

export default function ManageProducts() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
      <ProductForm />
      {/* List of products with delete/edit options here */}
    </div>
  );
}

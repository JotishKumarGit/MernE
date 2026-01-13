import React, { useEffect, useState } from "react";
import Pagination from "react-bootstrap/Pagination"; // update products controlller ko fix karna h 

import {
  Modal,
  Button,
  Table,  
  Form,
  Card,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import api from "../../api/apiClient";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";
import "./Admin.css";

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subCategory: "",
    image: null,
  });
const handlePageChange = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    setPage(pageNumber);
  }
};

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}&limit=8`);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
    setLoading(false);
  };

  // ================= FETCH CATEGORIES =================
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH SUBCATEGORIES =================
  const fetchSubCategories = async (categoryId) => {
    try {
      const { data } = await api.get(`/subcategories/category/${categoryId}`);
      setSubCategories(data.subCategories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    AOS.init({ duration: 800 });
  }, [page]);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // when category changes → load sub categories
    if (name === "category") {
      setFormData((prev) => ({ ...prev, subCategory: "" }));
      if (value) fetchSubCategories(value);
      else setSubCategories([]);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!formData.subCategory) {
      return toast.error("Please select sub category");
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      return toast.error("Please enter valid stock");
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("stock", formData.stock);
      fd.append("category", formData.category);
      fd.append("subCategory", formData.subCategory);

      if (formData.image instanceof File) {
        fd.append("image", formData.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, fd);
        toast.success("Product updated");
      } else {
        await api.post("/products", fd);
        toast.success("Product created");
      }

      fetchProducts();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Product save failed");
    }
    setSubmitting(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ================= MODAL =================
  const handleShow = (product = null) => {
    setEditingProduct(product);

    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.subCategory?.category?._id || "",
        subCategory: product.subCategory?._id || "",
        image: null,
      });

      if (product.subCategory?.category?._id) {
        fetchSubCategories(product.subCategory.category._id);
      }
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        subCategory: "",
        image: null,
      });
      setSubCategories([]);
    }

    setShowModal(true);
  };

  const handleClose = () => {
    setEditingProduct(null);
    setShowModal(false);
  };

  // ================= UI =================
  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h4>Manage Products</h4>
            <Button onClick={() => handleShow()}>+ Add Product</Button>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <Table bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p._id}>
                    <td>{(page - 1) * 8 + i + 1}</td>
                    <td>
                      <img
                        src={`${import.meta.env.VITE_API_URL}${p.image}`}
                        width="50"
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.subCategory?.category?.name}</td>
                    <td>{p.subCategory?.name}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock}</td>
                    <td>
                      <Button size="sm" onClick={() => handleShow(p)}>
                        Edit
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
{/* PAGINATION */}
{totalPages > 1 && (
  <div className="d-flex justify-content-center mt-3">
    <Pagination>
      <Pagination.Prev
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
      />

      {[...Array(totalPages)].map((_, index) => (
        <Pagination.Item
          key={index + 1}
          active={page === index + 1}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </Pagination.Item>
      ))}

      <Pagination.Next
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      />
    </Pagination>
  </div>
)}

      {/* MODAL */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Edit Product" : "Add Product"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Control
                  name="name"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Control
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Control
              as="textarea"
              rows={2}
              className="mt-3"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />

            <Form.Control
              type="file"
              className="mt-3"
              onChange={handleFileChange}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;

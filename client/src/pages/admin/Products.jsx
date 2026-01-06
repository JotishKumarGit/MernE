import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Card, Row, Col, Spinner } from "react-bootstrap";
import api from "../../api/apiClient";
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";
import "./Admin.css";

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // 🔥 PAGINATION STATES (MUST)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
console.log("categories:", categories);


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}&limit=8`);
      setProducts(data.products || []);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    AOS.init({ duration: 800 });
  }, [page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category", formData.category);

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully");
      }

      fetchProducts();
      handleClose();
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err.response?.data || err);
      }
    }
  };

  const handleShow = (product = null) => {
    setEditingProduct(product);

    setFormData(
      product
        ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category?._id || "",
          image: null,
        }
        : {
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          image: null,
        }
    );

    setShowModal(true);
  };

  const handleClose = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image: null,
    });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Card data-aos="fade-up">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Manage Products</h4>
            <div className="d-flex align-items-center gap-3 ">

              <div className="p-2 bg-light border rounded text-center shadow-sm d-none d-md-block" >
                <h5>
                  Total Products:{" "}
                  <span className="text-primary">{products.length}</span>
                </h5>
              </div>
              <Button variant="primary" onClick={() => handleShow()}>
                + Add Product
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="custom-loader-container">
              <div className="custom-loader"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((prod, index) => (
                    <tr key={prod._id} data-aos="fade-up">
                      <td>{(page - 1) * 8 + index + 1}</td>
                      <td>
                        <img src={`${import.meta.env.VITE_API_URL}${prod.image}`} alt={prod.name} width="50" height="50" style={{ borderRadius: "8px", objectFit: "cover" }} />
                      </td>
                      <td>{prod.name}</td>
                      <td>{prod.category?.name}</td>
                      <td>₹{prod.price}</td>
                      <td>{prod.stock}</td>
                      <td>{prod.averageRating?.toFixed(1) || 0}</td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2 mb-2" onClick={() => handleShow(prod)}>Edit</Button>
                        <Button variant="danger" size="sm" className="me-2 mb-2" onClick={() => handleDelete(prod._id)}>Delete</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-3">

              {/* PREVIOUS */}
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
              {/* PAGE NUMBERS */}
              {[...Array(totalPages)].map((_, index) => (
                <Button key={index} variant={page === index + 1 ? "primary" : "outline-primary"} size="sm" onClick={() => setPage(index + 1)}>{index + 1}</Button>
              ))}
              {/* NEXT */}
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title> {editingProduct ? "Edit Product" : "Add Product"} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleChange} >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control type="file" name="image" accept="image/*" onChange={handleFileChange} />
              {editingProduct && editingProduct.image && (
                <div className="mt-2">
                  <small>Current Image:</small>
                  <br />
                  <img src={`${import.meta.env.VITE_API_URL}${editingProduct.image}`} alt="current" width="120" height="120" style={{ borderRadius: "8px", objectFit: "cover" }} />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}> Cancel </Button>

          <Button variant="primary" onClick={handleSubmit}disabled={submitting}>
            {submitting ? ( 
              <Spinner size="sm" animation="border" />
            ) : editingProduct ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Products;

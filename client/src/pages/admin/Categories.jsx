// frontend/src/pages/admin/Categories.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Card, Spinner } from "react-bootstrap";
import api from "../../api/apiClient";
import { toast } from "react-toastify";

const Categories = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // NOTE: backend se aapke controller `getAllCategories` me array directly return ho rha hai
      const { data } = await api.get(`/categories?page=${page}&limit=${limit}`);
      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching categories:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Component mount hone par fetch call kare
  useEffect(() => {
    fetchCategories();
  }, [page]);

  // Handle form input change 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Update category
  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        // Agar edit mode me hai -> update API call
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success("Category is updated successfully");
      } else {
        // Otherwise -> create API call
        await api.post("/categories", formData);
        toast.success("Category is created successfully");
      }
      fetchCategories(); // Refresh list
      handleClose(); // Modal close
    } catch (err) {
      console.error("Error saving category:", err.response?.data || err);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`categories/${id}`);
        toast.success("Category is deleted successfully");
        fetchCategories(); // Refresh list
      } catch (err) {
        console.error("Error deleting category:", err.response?.data || err);
      }
    }
  };

  // Open modal for Add/Edit
  const handleShow = (category = null) => {
    setEditingCategory(category);
    setFormData(category || { name: "", description: "" });
    setShowModal(true);
  };

  // Close modal
  const handleClose = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          {/* Header with Add button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Manage Categories</h4>

            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-light border rounded text-center shadow-sm d-none d-md-block">
                <h5 className="mb-0">
                  Total Categories:{" "}
                  <span className="text-primary">{categories.length}</span>
                </h5>
              </div>

              <Button variant="primary" onClick={() => handleShow()}>
                + Add Category
              </Button>
            </div>
          </div>


          {/* Category Table */}
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>{cat.name}</td>
                      <td>{cat.description}</td>
                      <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleShow(cat)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(cat._id)} >Delete</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          <div className="d-flex justify-content-center mt-3">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)} > Prev</Button>

            <span className="mx-3 mt-2"> Page {page} of {totalPages}</span>
            <Button
              variant="secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)} > Next </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? "Edit Category" : "Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Category Name */}
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter category name" />
            </Form.Group>

            {/* Category Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Enter description" />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingCategory ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;

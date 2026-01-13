import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Card, Spinner, Image } from "react-bootstrap";
import api from "../../api/apiClient";
import { toast } from "react-toastify";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", image: null, isPopular: false });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/categories?page=${page}&limit=${limit}`);
      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  /* ================= INPUT HANDLERS ================= */
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };
  const handleImageChange = (e) => setFormData({ ...formData, image: e.target.files[0] });

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Name is required");
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("isPopular", formData.isPopular); // <-- added
      if (formData.image) payload.append("image", formData.image);

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category created successfully");
      }

      fetchCategories();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success("Category deleted");
        if (categories.length === 1 && page > 1) setPage(page - 1);
        else fetchCategories();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  /* ================= MODAL ================= */
  const handleShow = (category = null) => {
    setEditingCategory(category);
    setFormData({
      name: category?.name || "",
      description: category?.description || "",
      image: null,
      isPopular: category?.isPopular || false, // <-- added
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: null, isPopular: false });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Card className="shadow">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h4>Manage Categories</h4>
            <Button onClick={() => handleShow()}>+ Add Category</Button>
          </div>

          {loading ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Table bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Popular</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length ? categories.map((cat, idx) => (
                  <tr key={cat._id}>
                    <td>{(page - 1) * limit + idx + 1}</td>
                    <td>
                      <Image
                        src={cat.image ? `${import.meta.env.VITE_API_URL}${cat.image}` : "https://via.placeholder.com/50"}
                        roundedCircle width={50} height={50}
                      />
                    </td>
                    <td>{cat.name}</td>
                    <td>{cat.description}</td>
                    <td>{cat.isPopular ? "Yes" : "No"}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => handleShow(cat)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(cat._id)}>Delete</Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center">No categories found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          {/* PAGINATION */}
          <div className="d-flex justify-content-center">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="mx-3 mt-2">Page {page} of {totalPages}</span>
            <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </Card.Body>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCategory ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Popular Category"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Category Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
              {editingCategory && editingCategory.image && (
                <div className="mt-2">
                  <small>Current Image:</small>
                  <br />
                  <Image src={`${import.meta.env.VITE_API_URL}${editingCategory.image}`} width={80} height={80} rounded />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : editingCategory ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;

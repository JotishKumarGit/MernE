import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Card, Spinner, Image } from "react-bootstrap";
import api from "../../api/apiClient";
import { toast } from "react-toastify";

const SubCategories = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubCat, setEditingSubCat] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", category: "", image: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  // Fetch main categories for dropdown
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories?page=1&limit=100");
      setCategories(data.categories);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch sub-categories
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/subcategories?page=${page}&limit=${limit}`);
      setSubCategories(data.subCategories || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch sub-categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, [page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.category) return toast.error("Select a main category");
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      if (formData.image) payload.append("image", formData.image);

      if (editingSubCat) {
        await api.put(`/subcategories/${editingSubCat._id}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Sub-category updated");
      } else {
        await api.post("/subcategories", payload, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Sub-category created");
      }
      fetchSubCategories();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/subcategories/${id}`);
        toast.success("Deleted successfully");
        fetchSubCategories();
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  const handleShow = (subCat = null) => {
    setEditingSubCat(subCat);
    setFormData({
      name: subCat?.name || "",
      description: subCat?.description || "",
      category: subCat?.category?._id || "",
      image: null,
    });
    setShowModal(true);
  };

  const handleClose = () => {
    setEditingSubCat(null);
    setFormData({ name: "", description: "", category: "", image: null });
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <Card className="shadow">
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <h4>Manage Sub-Categories</h4>
            <Button onClick={() => handleShow()}>+ Add Sub-Category</Button>
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
                  <th>Main Category</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.length ? subCategories.map((sub, idx) => (
                  <tr key={sub._id}>
                    <td>{(page-1)*limit + idx + 1}</td>
                    <td>
                      <Image src={`${import.meta.env.VITE_API_URL}${sub.image}`} roundedCircle width={50} height={50} />
                    </td>
                    <td>{sub.name}</td>
                    <td>{sub.category?.name}</td>
                    <td>{sub.description}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => handleShow(sub)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(sub._id)}>Delete</Button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center">No sub-categories found</td></tr>
                )}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          <div className="d-flex justify-content-center my-2">
            <Button disabled={page===1} onClick={()=>setPage(page-1)}>Prev</Button>
            <span className="mx-3 mt-2">Page {page} of {totalPages}</span>
            <Button disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSubCat ? "Edit Sub-Category" : "Add Sub-Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Main Category</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={handleImageChange} />
              {editingSubCat && <small className="text-muted">Leave empty to keep old image</small>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingSubCat ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SubCategories;

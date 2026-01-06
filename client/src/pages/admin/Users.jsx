import React, { useEffect, useState } from "react";
import { Table, Card, Spinner } from "react-bootstrap";
import api from "../../api/apiClient";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPages] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      setUsers(data.users || []);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="container mt-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <div className="">
              <h4 className="mb-3">All Users</h4>
            </div>
            <div className="mb-3">
              <button className="btn btn-primary fs-5">Total Users : {users.length}</button>
            </div>
          </div>
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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{(page - 1) * limit + index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {/* pagination */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPages(page - 1)}>Previous</button>
              </li>
              <li className="page-item active">
                <span className="page-link">{page} / {totalPages}</span>
              </li>
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPages(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Users;

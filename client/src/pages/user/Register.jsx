import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/apiClient";

function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { theme } = useThemeStore();

  // Form state
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", profilePic: null,
  });

  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      // Build FormData
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (formData.profilePic) {
        formDataToSend.append("profilePic", formData.profilePic);
      }

      // API call
      const response = await api.post("/auth/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.data?.success) {

        localStorage.setItem("token", response.data.token);
        toast.success(response.data.message || "Registration successful! 🎉");

        navigate("/login");
        console.log(response.data);
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container-fluid d-flex justify-content-center py-2 align-items-center min-vh-100 ${theme === "dark" ? "bg-dark text-light" : "bg-light"}`}>
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4">
          <div className={`card shadow p-4 ${theme === "dark" ? "bg-secondary text-light" : "bg-white"}`} >
            <h2 className="text-center mb-4">Create Account</h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" placeholder="Enter your name" value={formData.name} onChange={handleChange} />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-control" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" placeholder="Enter password" value={formData.password} onChange={handleChange} />
              </div>

              {/* Confirm Password */}
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
              </div>

              {/* Profile Pic */}
              <div className="mb-3">
                <label className="form-label">Profile Picture</label>
                <input type="file" name="profilePic" className="form-control" accept="image/*" onChange={handleChange} />
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
            </form>
            <p className="text-center mt-3">Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

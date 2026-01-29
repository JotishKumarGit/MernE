import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import { useAuthStore } from "../../../stores/authStore";
import { toast } from "react-toastify";

export default function UserProfile() {
  // Get user and setUser from auth store 
  const { user, setUser, initializeAuth } = useAuthStore();

  const [form, setForm] = useState({ name: "", profilePic: "" });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  //Load user data on mount or when auth store changes
  useEffect(() => {
    //Ensure user is loaded (refresh-safe)
    const loadUser = async () => {
      if (!user) {
        //fetch user from server if auth store empty
        await initializeAuth();
      } else {
        setForm({
          name: user.name || "",
          profilePic: user.profilePic || "",
        });
      }
    };
    loadUser();
  }, [user, initializeAuth]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("name", form.name);
      if (file) payload.append("profilePic", file);

      // Update profile on server
      const { data } = await api.put("/auth/update-profile", payload);

      // Update global auth store (refresh-safe)
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update local form state immediately
      setForm({
        name: data.user.name,
        profilePic: data.user.profilePic,
      });
      console.log(file);
      setFile(null);

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animated-card">
      <div className="card-body">
        <h5>Profile</h5>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input name="name"
                value={form.name} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                name="email" value={user?.email || ""} disabled className="form-control" />
            </div>

            <div className="col-12">
              <label className="form-label">Profile picture</label>
              <input type="file" className="form-control" accept="image/*" onChange={handleFile} />
            </div>

            {/* ✅ Image preview */}
            {/* <div className="mt-2">
              {file ? (
                <img src={URL.createObjectURL(file)} alt="preview" width={80} className="rounded" />
              ) : form.profilePic ? (
                <img src={`${import.meta.env.VITE_API_URL}${form.profilePic}`} alt="profile" width={80} className="rounded" />
              ) : (
                <img src="/default-avatar.png" alt="default" width={80} className="rounded" />
              )}
            </div> */}

          </div>
          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={loading} > {loading ? "Saving..." : "Save"} </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm({ name: user?.name || "", profilePic: user?.profilePic || "", })} > Reset </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import OrderDetailModal from "./OrderDetailModal";
import LoadingPage from "../../../components/ui/LoaderPage";
import { toast } from "react-toastify";


export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/my-orders");
      setOrders(data.orders || data || []);
    } catch (err) {
      console.error("fetch orders error", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <h5>My Orders</h5>
      {orders.length === 0 ? (
        <div className="text-center py-4">You have no orders yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Order Id</th>
                <th>Total</th>
                <th>Status</th>
                <th>Shipping Address</th>
                 <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o._id}>
                  <td>{i + 1}</td>
                  <td className="text-truncate" style={{ maxWidth: 160 }}>{o._id}</td>
                  <td>₹{o.totalAmount}</td>
                  <td>{o.status}</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {o.address
                      ? `${o.address.fullName}, ${o.address.addressLine}, ${o.address.city}, ${o.address.state} - ${o.address.pincode}`
                      : "N/A"}
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(o)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* If selected, show modal. When closed, also reload orders. */}
      <OrderDetailModal order={selected} onClose={() => { setSelected(null); load(); }} />
    </div>
  );
}

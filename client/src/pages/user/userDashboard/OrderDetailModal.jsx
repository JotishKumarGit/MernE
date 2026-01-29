import React, { useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";
import api from "../../../api/apiClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function OrderDetailModal({ order, onClose }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  // Update localOrder when prop changes
  useEffect(() => setLocalOrder(order), [order]);

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch full order details
  useEffect(() => {
    if (!order?._id) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${order._id}`);
        setLocalOrder(data.order || data);
      } catch (err) {
        console.error("fetch order details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [order]);

  if (!order) return null;

  const onBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  // Generate PDF invoice
  const generateInvoicePDF = (order) => {
    if (!order) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Invoice", 14, 22);

    // Order info
    doc.setFontSize(11);
    doc.text(`Order ID: ${order._id}`, 14, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 38);
    doc.text(`Status: ${order.status}`, 14, 44);

    // Shipping address
    doc.text("Shipping Address:", 14, 54);
    const address = order.address || order.shippingAddress;
    if (address) {
      doc.text(`${address.fullName}`, 14, 60);
      doc.text(`${address.phone}`, 14, 66);
      doc.text(`${address.addressLine}`, 14, 72);
      doc.text(`${address.city}, ${address.state} - ${address.pincode}`, 14, 78);
    } else {
      doc.text("N/A", 14, 60);
    }

    // Items table
    const tableColumn = ["Product", "Qty", "Price", "Total"];
    const tableRows = order.orderItems.map((item) => [
      item.product?.name || item.product,
      item.qty,
      `₹${item.product?.price || item.price}`,
      `₹${(item.product?.price || item.price) * item.qty}`,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    // Total & Payment
    const finalY = doc.lastAutoTable?.finalY || 90;
    doc.text(`Total: ₹${order.totalAmount}`, 14, finalY + 10);
    doc.text(`Payment Method: ${order.paymentMethod || "—"}`, 14, finalY + 16);

    // Save PDF
    doc.save(`invoice_${order._id}.pdf`);
  };

  return (
    <div
      className="custom-modal-backdrop show"
      onMouseDown={onBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="custom-modal" ref={modalRef} role="document">
        <div className="custom-modal-header">
          <h5 className="modal-title">Order Details</h5>
          <button className="btn btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="custom-modal-body">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <>
              <div className="invoice-card p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="mb-0">
                      Order ID: <small className="text-muted">{localOrder?._id}</small>
                    </h6>
                    <small className="text-muted">
                      Placed: {new Date(localOrder?.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="text-end">
                    <strong>₹{localOrder?.totalAmount}</strong>
                    <div className="text-muted small">{localOrder?.status}</div>
                  </div>
                </div>

                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localOrder?.orderItems?.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.product?.name || it.product}</td>
                        <td>{it.qty}</td>
                        <td className="text-end">₹{it.product?.price || it.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex justify-content-between mt-3">
                  <div>
                    <h6 className="mb-0">Customer</h6>
                    <small className="text-muted">{localOrder?.shippingAddress?.fullName || localOrder?.customerName}</small>
                    <div className="small text-muted">
                      {localOrder?.shippingAddress
                        ? `${localOrder.shippingAddress.addressLine}, ${localOrder.shippingAddress.city}, ${localOrder.shippingAddress.state} - ${localOrder.shippingAddress.pincode}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">Payment</div>
                    <div className="fw-semibold">{localOrder?.paymentMethod || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h6>Admin Notes</h6>
                <div className="p-2 border rounded">
                  {localOrder?.adminNotes || <small className="text-muted">No notes from admin yet.</small>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="custom-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => generateInvoicePDF(localOrder)}>
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

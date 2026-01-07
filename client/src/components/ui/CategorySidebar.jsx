import React from "react";
import { FaList, FaTag } from "react-icons/fa";

export default function CategorySidebar({ categories = [], selected = "", onSelect }) {
  return (
    <div className="mb-4 p-3 rounded cs-sidebar-card">
      <h5 className="mb-3 fw-bold cs-sidebar-title">
        <FaList className="me-2" />
        Categories
      </h5>

      <ul className="list-group list-group-flush">
        {/* All */}
        <li className={`list-group-item cs-category-item ${!selected ? "cs-active" : ""}`} onClick={() => onSelect("")} >
          <FaTag className="me-2 cs-icon" />
          All
        </li>
        {categories.map((c) => (
          <li key={c._id} className={`list-group-item cs-category-item ${selected === c._id ? "cs-active" : ""}`} onClick={() => onSelect(c._id)} >
            <FaTag className="me-2 cs-icon" />
            {c.name}
          </li>
        ))}
      </ul>

      {/* Scoped CSS */}
      <style jsx>{`
        .cs-sidebar-card {
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        .cs-sidebar-title {
          color: #0d6efd;
          display: flex;
          align-items: center;
        }

        .cs-category-item {
          cursor: pointer;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 6px;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          color: #333;
          background: #f8f9fa;
        }

        .cs-icon {
          color: #6c757d;
          transition: all 0.3s ease;
        }

        .cs-category-item:hover {
          background: #eef4ff;
          transform: translateX(6px);
        }

        .cs-category-item:hover .cs-icon {
          color: #0d6efd;
        }

        .cs-active {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.4);
        }

        .cs-active .cs-icon {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}

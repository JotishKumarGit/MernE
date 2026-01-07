// src/components/FiltersPanel.jsx
import React, { useState, useEffect } from "react";

export default function FiltersPanel({ query = {}, onChangeParam }) {
  const [min, setMin] = useState(query.minPrice || "");
  const [max, setMax] = useState(query.maxPrice || "");
  const [minRating, setMinRating] = useState(query.minRating || "");
  const [sort, setSort] = useState(query.sort || "");

  useEffect(() => {
    setMin(query.minPrice || "");
    setMax(query.maxPrice || "");
    setMinRating(query.minRating || "");
    setSort(query.sort || "");
  }, [query]);

  const apply = () => {
    onChangeParam("minPrice", min || "");
    onChangeParam("maxPrice", max || "");
    onChangeParam("minRating", minRating || "");
    onChangeParam("sort", sort || "");
  };

  const clearAll = () => {
    setMin(""); setMax(""); setMinRating(""); setSort("");
    onChangeParam("minPrice", "");
    onChangeParam("maxPrice", "");
    onChangeParam("minRating", "");
    onChangeParam("sort", "");
  };

  return (
    <div className="mb-4 p-3 rounded fp-card">
      <h5 className="mb-3 fw-bold fp-title">Filters</h5>

      <div className="mb-3">
        <label className="fp-label">Price</label>
        <div className="d-flex gap-2">
          <input type="number" className="form-control fp-input" placeholder="Min" value={min} onChange={e => setMin(e.target.value)} />
          <input type="number" className="form-control fp-input" placeholder="Max" value={max} onChange={e => setMax(e.target.value)} />
        </div>
      </div>
      <div className="mb-3">
        <label className="fp-label">Min Rating</label>
        <select className="form-select fp-select" value={minRating} onChange={e => setMinRating(e.target.value)} >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="fp-label">Sort</label>
        <select className="form-select fp-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Default</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      <div className="d-flex gap-2">
        <button className="btn fp-btn-primary" onClick={apply}>Apply</button>
        <button className="btn fp-btn-secondary" onClick={clearAll}>Clear</button>
      </div>
      
      {/* Scoped UI Styles */}
      <style jsx>{`
        .fp-card {
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease;
        }

        .fp-card:hover {
          transform: translateY(-2px);
        }

        .fp-title {
          color: #0d6efd;
        }

        .fp-label {
          font-weight: 500;
          margin-bottom: 6px;
          color: #495057;
        }

        .fp-input,
        .fp-select {
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .fp-input:focus,
        .fp-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.25);
        }

        .fp-btn-primary {
          background: linear-gradient(135deg, #0d6efd, #0b5ed7);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .fp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(13, 110, 253, 0.4);
        }

        .fp-btn-secondary {
          background: #f1f3f5;
          color: #333;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .fp-btn-secondary:hover {
          background: #e9ecef;
        }
      `}</style>
    </div>
  );
}

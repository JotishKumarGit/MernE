import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/apiClient";
import CategorySidebar from "../../components/ui/CategorySidebar";
import FiltersPanel from "../../components/ui/FiltersPanel";
import ProductCard from "../../components/ui/ProductCard";
import Pagination from "../../components/ui/Pagination";
import LoadingPage from '../../components/ui/LoaderPage';
import baner_1 from '/baner_1.png';
import baner_2 from '/baner_new_2.jpg';
import baner_3 from '/baner_new_3.jpg';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [catProducts, setCatProducts] = useState({}); 
  const [data, setData] = useState({ products: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  // read query params helpers
  const getParam = (k) => searchParams.get(k) || "";

  // fetch categories + small product lists for each (top 4)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories || []);
        // optional: limit to 6 categories to save requests
        const topCats = (res.data.categories || []).slice(0, 6);
        const promises = topCats.map((c) =>
          api.get(`/products?category=${c._id}&limit=4`)
        );
        const results = await Promise.all(promises);
        const map = {};
        results.forEach((r, idx) => {
          map[topCats[idx]._id] = r.data.products || [];
        });
        setCatProducts(map);
      } catch (err) {
        console.error("Load categories failed", err);
      }
    };
    load();
  }, []);

  // fetch filtered products (main grid) when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const qs = searchParams.toString();
        const res = await api.get(`/products?${qs}`);
        // backend returns { total, page, pages, products }
        setData({
          products: res.data.products || [],
          total: res.data.total || 0,
          page: res.data.page || 1,
          pages: res.data.pages || 1,
        });
      } catch (err) {
        console.error("fetchProducts error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // update a single param
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value) params.delete(key);
    else params.set(key, value);
    // reset page if filter changes
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="container-fluid p-0">

      <div id="carouselExample" className="carousel slide">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src={baner_1} style={{height:'300px',width:'100%' }} className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item">
            <img src={baner_2} style={{height:'300px',width:'100%' }} className="d-block w-100" alt="..." />
          </div>
          <div className="carousel-item">
            <img src={baner_3} style={{height:'300px',width:'100%' }} className="d-block w-100" alt="..." />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>
      
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-3">
            <CategorySidebar categories={categories} selected={getParam("category")} onSelect={(id) => updateParam("category", id)} />
            <FiltersPanel query={{ minPrice: getParam("minPrice"), maxPrice: getParam("maxPrice"), minRating: getParam("minRating"), sort: getParam("sort"), }} onChangeParam={updateParam} />
          </div>

          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Total {data.total}</strong> results</div>
              <div>
                {/* optional quick sort select */}
              </div>
            </div>

            {loading ? (
              <LoadingPage />
            ) : (
              <div className="row g-3">
                {data.products.map((p) => (
                  <div className="col-md-4" key={p._id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Pagination page={data.page} pages={data.pages} onPage={(p) => updateParam("page", p)} />
            </div>
          </div>
        </div>

        {/* Category sections (horizontal rows) */}
        <hr className="my-4" />
        <h4>Top Categories</h4>
        {categories.slice(0, 6).map((cat) => (
          <section key={cat._id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">{cat.name}</h5>
              <button className="btn btn-sm btn-link" onClick={() => updateParam("category", cat._id)}>
                View more
              </button>
            </div>
            <div className="row g-3">
              {(catProducts[cat._id] || []).map((p) => (
                <div className="col-6 col-md-3" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        ))}

      </div>
    </div>
  );
}

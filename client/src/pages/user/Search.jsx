import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import {useThemeStore} from '../../stores/themeStore';

import ProductCard from "../../components/ui/ProductCard";
import Pagination from "../../components/ui/Pagination";
import LoadingPage from "../../components/ui/LoaderPage";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("keyword") || "";

    const [data, setData] = useState({
        products: [],
        total: 0,
        page: 1,
        pages: 1,
    });

    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useThemeStore((state)=>state.theme);


    // 🔹 FETCH SEARCH PRODUCTS
    useEffect(() => {
        if (!query) return;

        const fetchSearch = async () => {
            setLoading(true);
            try {
                const qs = searchParams.toString();
                const res = await api.get(`/products?${qs}`);

                setData({
                    products: res.data.products || [],
                    total: res.data.total || 0,
                    page: res.data.page || 1,
                    pages: res.data.pages || 1,
                });

                // 🔹 Fetch related products using first result
                if (res.data.products?.length > 0) {
                    const first = res.data.products[0];
                    fetchRelated(first.category?._id, first._id);
                } else {
                    setRelated([]);
                }
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSearch();
    }, [searchParams]);

    // 🔹 FETCH RELATED PRODUCTS
    const fetchRelated = async (categoryId, excludeId) => {
        try {
            const res = await api.get(`/products/related?category=${categoryId}&exclude=${excludeId}&limit=8`
            );
            setRelated(res.data.products || []);
        } catch (err) {
            console.error("Related fetch error", err);
        }
    };

    // 🔹 Pagination handler
    const onPageChange = (p) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", p);
        setSearchParams(params);
    };

    const bannerImage = data.products[0]?.image ? `${import.meta.env.VITE_API_URL}${data.products[0].image}` : "/search-banner.jpg";

    return (
        <div className={`container-fluid p-0 ${theme === 'dark' ? 'bg-dark text-light' : ""} `}  style={{ background: theme === "dark" ? '#121212' : '#f6f6f6', minHeight:"100vh" }}>
            {/* banner */}
            {query && (
                <div className="text-white text-center d-flex flex-column justify-content-center align-items-center shadow-lg mb-4" style={{ minHeight: "38vh", background: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${bannerImage}) center/cover no-repeat`, }} >
                    <h1 className="fw-bold display-5"> Search Results </h1>
                    <p className="lead mt-2"> "{query}" — {data.total} products found </p>
                </div>
            )}
            <div className="container py-5">
                {/* 🔹 BREADCRUMB */}
                <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"> <Link to="/">Home</Link> </li>
                        <li className="breadcrumb-item active"> Search: "{query}" </li>
                    </ol>
                </nav>
                {/* 🔹 TITLE */}
                <h4 className="mb-4"> Search results for <span className="text-primary">"{query}"</span> </h4>

                {/* 🔹 SEARCH RESULTS */}
                {loading ? (
                    <LoadingPage />
                ) : (
                    <>
                        {data.products.length === 0 ? (
                            <div className="text-center py-5"> <h5>No products found</h5> </div>
                        ) : (
                            <>
                                <div className="row g-3">
                                    {data.products.map((p) => (<div className="col-6 col-md-4 col-lg-3" key={p._id}>
                                        <ProductCard product={p} />
                                    </div>))}
                                </div>

                                {/* 🔹 PAGINATION */}
                                {data.pages > 1 && (
                                    <div className="mt-4 d-flex justify-content-center">
                                        <Pagination page={data.page} pages={data.pages} onPage={onPageChange} />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* 🔹 RELATED PRODUCTS */}
                {related.length > 0 && (
                    <div className="mt-5">
                        <h5 className="mb-3">Related Products</h5>
                        <div className="row g-3">
                            {related.map((p) => (
                                <div className="col-6 col-md-3" key={p._id}>
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

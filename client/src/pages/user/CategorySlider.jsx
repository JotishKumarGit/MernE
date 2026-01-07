import React from "react";
import Slider from "react-slick";
import "./User.css";

const CategorySlider = ({ categories = [], active, onSelect }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <div className="category-slider-wrapper" style={{ backgroundColor: "" }} >
      <h2 className="align-items-center text-center py-5">Top Categories</h2>
      <Slider {...settings}>
        {categories.map((cat) => (
          <div key={cat._id}>
            <div
              className={`category-item ${active === cat._id ? "active" : ""
                }`}
              onClick={() => onSelect(cat._id)}
            >
              <div className="category-img-wrapper">
                <img
                  src={`${import.meta.env.VITE_API_URL}${cat.image}`}
                  alt={cat.name}
                />
              </div>
              <p className="category-name">{cat.name}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CategorySlider;

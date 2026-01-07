import { motion } from "framer-motion";
import offer from "/offers.jpg";

export default function OfferBanner() {
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="container my-5">
            <div className="row align-items-center bg-dark text-white rounded-4 p-4 overflow-hidden">
                <div className="col-md-7">
                    <h2 className="fw-bold">🔥 Big Sale is Live!</h2>
                    <p className="fs-5">Get up to <span className="text-warning fw-bold">50% OFF</span> on selected products.</p>
                    <button className="btn btn-warning btn-lg my-3">Shop Now</button>
                </div>
                <div className="col-md-5 text-center">
                    <motion.img src={offer} alt="offer" className="img-fluid" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} />
                </div>
            </div>
        </motion.div>
    );
}

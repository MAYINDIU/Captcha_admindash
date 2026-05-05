import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Maximize2, X, ChevronLeft, 
  ChevronRight, Phone, LayoutGrid, Home, Info 
} from 'lucide-react';

const API_URL = "https://alhamarahomesbd.com/alhamra-backend/public/api/v1/products";

const OurProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // 1. Fetch Data (No Token Needed)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const result = await response.json();
        setProducts(result.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : 'unset';
  }, [selectedProduct]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 font-sans md:px-10">
      
      {/* Header */}
      <div className="mx-auto max-w-7xl mb-12">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Our Properties</h1>
        <div className="mt-2 h-1 w-16 bg-red-600"></div>
      </div>

      {/* --- PRODUCT GRID --- */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            onClick={() => { setSelectedProduct(product); setActiveImageIdx(0); }}
            className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 transition-all hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
              <img
                src={product.image_url[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 rounded bg-blue-900 px-2 py-1 text-[10px] font-bold uppercase text-white">
                {product.category.name}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-md font-bold text-slate-800 truncate">{product.name}</h3>
              <div className="mt-1 flex items-center text-xs text-slate-500">
                <MapPin size={12} className="mr-1 text-red-500" />
                {product.attributes?.location || "Bangladesh"}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-black text-blue-900">৳{parseFloat(product.price).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-blue-600 border-b border-blue-600">VIEW DETAILS</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- E-COMMERCE STYLE POPUP --- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex h-auto max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-[110] flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform active:scale-90"
              >
                <X size={18} />
              </button>

              {/* LEFT: IMAGE GALLERY */}
              <div className="flex flex-col bg-slate-100 md:w-1/2">
                <div className="relative flex aspect-square items-center justify-center bg-white md:aspect-auto md:flex-1">
                  <img
                    src={selectedProduct.image_url[activeImageIdx]}
                    className="h-full w-full object-contain p-4"
                    alt="Property"
                  />
                  {selectedProduct.image_url.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
                      <button onClick={() => setActiveImageIdx(prev => prev === 0 ? selectedProduct.image_url.length-1 : prev-1)} className="rounded-full bg-white/80 p-2 shadow"><ChevronLeft size={16}/></button>
                      <button onClick={() => setActiveImageIdx(prev => (prev+1) % selectedProduct.image_url.length)} className="rounded-full bg-white/80 p-2 shadow"><ChevronRight size={16}/></button>
                    </div>
                  )}
                </div>
                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto border-t p-3 bg-slate-50">
                  {selectedProduct.image_url.map((url, idx) => (
                    <img 
                      key={idx} src={url} 
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-12 w-12 cursor-pointer rounded border-2 object-cover ${activeImageIdx === idx ? 'border-red-600' : 'border-transparent opacity-50'}`}
                    />
                  ))}
                </div>
              </div>

              {/* RIGHT: PROPERTY DETAILS */}
              <div className="flex flex-col overflow-y-auto p-6 md:w-1/2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">{selectedProduct.category.name}</span>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{selectedProduct.name}</h2>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Size</p>
                    <p className="text-sm font-bold text-slate-800">{selectedProduct.attributes?.size || selectedProduct.attributes?.plot_size || "N/A"}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{selectedProduct.product_type}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase text-slate-400">Description</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="mt-auto pt-8">
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Price</p>
                    <p className="text-3xl font-black text-blue-900">৳ {parseFloat(selectedProduct.price).toLocaleString()}</p>
                  </div>
                  <button className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-4 font-bold text-white transition-all hover:bg-blue-800">
                    <Phone size={18} className="mr-2" /> CONTACT AGENT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OurProducts;
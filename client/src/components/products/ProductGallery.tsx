import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-3xl bg-[#F9F7FE] border border-[#E8E3FA] overflow-hidden shadow-sm">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt={`${productName} view ${activeIndex + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover object-center"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx
                  ? 'border-[#7444FF] shadow-sm scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

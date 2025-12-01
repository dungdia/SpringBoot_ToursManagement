import React, { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Nếu bạn dùng Ant Design Icons
// Nếu không dùng Ant Design Icons, bạn có thể dùng các ký tự '<' và '>' hoặc tự tạo icon

const images = [
   "https://s3-cmc.travel.com.vn/vtv-image/Images/Tour/tfd__2_13187_ho-guom-2.webp",
   "https://s3-cmc.travel.com.vn/vtv-image/Images/Tour/tfd__1_13166_thac-ban-gioc-4.webp",
   "https://s3-cmc.travel.com.vn/vtv-image/Images/Tour/tfd__2_13166_song-nho-que.webp",
   "https://s3-cmc.travel.com.vn/vtv-image/Images/Tour/tfd__0_13166_nui-doi-quan-ba-2.webp",
];

const SLIDE_INTERVAL = 3000; // Thời gian tự động chuyển ảnh (3 giây)

export default function SlideShow() {
   const [currentIndex, setCurrentIndex] = useState(0); // Index của ảnh hiện tại

   // --- Logic Tự động Chuyển ảnh ---
   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
         );
      }, SLIDE_INTERVAL);

      // Dọn dẹp interval khi component unmount hoặc re-render
      return () => clearInterval(interval);
   }, []); // [] đảm bảo useEffect chỉ chạy 1 lần khi mount

   // --- Logic Chuyển ảnh thủ công ---
   const goToNext = () => {
      setCurrentIndex((prevIndex) =>
         prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
   };

   const goToPrevious = () => {
      setCurrentIndex((prevIndex) =>
         prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
   };

   // --- Logic Chuyển đến ảnh cụ thể (dấu chấm) ---
   const goToSlide = (index) => {
      setCurrentIndex(index);
   };

   return (
      <div className="relative w-full!  mx-auto overflow-hidden rounded-lg shadow-lg">
         {/* Ảnh chính */}
         <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full! h-96 object-cover transition-opacity duration-700 ease-in-out"
         />

         {/* Nút Previous */}
         <button
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors duration-300"
         >
            <LeftOutlined style={{ fontSize: "24px" }} />
         </button>

         {/* Nút Next */}
         <button
            onClick={goToNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors duration-300"
         >
            <RightOutlined style={{ fontSize: "24px" }} />
         </button>

         {/* Dấu chấm chỉ báo */}
         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
               <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full ${
                     index === currentIndex ? "bg-white" : "bg-gray-500"
                  } hover:bg-white transition-colors duration-300`}
               ></button>
            ))}
         </div>
      </div>
   );
}

import React from "react";
import Header from "./header";
import SlideShow from "./slideShow";
import "./userLayout.css";
import RenderTour from "./renderTour";
import { HeaderUserProvider } from "@/providers/headerUserProvider";
import Footer from "./footer";

export default function UserLayout() {
   return (
      <>
         <HeaderUserProvider>
            <div className="header flex justify-center items-center h-[80px] mb-3">
               <div className="container">
                  {/* Header sử dụng Context, nên nó phải nằm trong Provider */}
                  <Header />
               </div>
            </div>

            <div className="container mt-10! mb-10!">
               <SlideShow />
            </div>

            <div className="container">
               {/* RenderTour cũng nên nằm trong Provider vì nó cần dữ liệu từ Header (searchValue, selectedArea) để lọc tour */}
               <RenderTour />
            </div>
            <div className="container mt-10!">
               {/* RenderTour cũng nên nằm trong Provider vì nó cần dữ liệu từ Header (searchValue, selectedArea) để lọc tour */}
               <Footer />
            </div>
         </HeaderUserProvider>
      </>
   );
}

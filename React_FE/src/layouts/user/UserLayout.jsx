import React from "react";
import Header from "./header";
import "./userLayout.css";

export default function UserLayout() {
   return (
      <div className="header flex justify-center items-center h-[80px] mb-3">
         <div className="container">
            <Header />
         </div>
      </div>
   );
}

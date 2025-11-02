import { decryptData } from "@/utils/CryptoJS";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function InfoHeader() {
   const naviagte = useNavigate();
   console.log(
      decryptData(
         // Dùng decodeURIComponent() để chuyển %2B thành +, %2F thành /
         decodeURIComponent(
            "U2FsdGVkX18UZNWytgFRB4n7RtMD%2B0PcNH2OPweqRNzm9uvhpnZbIgqFn8eoGHEs"
         )
      )
   );

   return (
      <header
         id="info-user-header"
         className="w-full h-16 bg-slate-400 flex justify-between items-center px-12"
      >
         <p onClick={() => naviagte("/user")}>Header</p>
      </header>
   );
}

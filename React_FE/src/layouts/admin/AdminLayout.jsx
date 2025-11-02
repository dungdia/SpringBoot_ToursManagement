import React, { useEffect, useState } from "react";
import Header from "./header";
import Menu from "./menu";
import { Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function AdminLayout() {
   const navigate = useNavigate();
   const [checkRoleAdmin, setCheckRoleAdmin] = useState(false);

   useEffect(() => {
      // kiểm tra token từ cookie
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
         navigate("/login");
         return;
      }

      const accountLogged =
         JSON.parse(localStorage.getItem("accountLogged")) || {};

      const checkIsAdmin = accountLogged?.roles?.some(
         (role) => role === "ROLE_ADMIN" || role === "ROLE_OWNER"
      );

      if (checkIsAdmin) {
         setCheckRoleAdmin(true);
      } else {
         navigate("/user");
      }
   }, [navigate]);

   if (!checkRoleAdmin) {
      return null; // Hoặc bạn có thể hiển thị một spinner hoặc thông báo chờ
   }

   return (
      <div>
         <Header />
         <div className="flex ">
            <Menu className="" />
            <div className="flex-1 p-6">
               <Outlet />
            </div>
         </div>
      </div>
   );
}

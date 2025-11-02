import React, { useEffect, useState } from "react";
import InfoHeader from "./header";
import InfoMenu from "./menu";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { decryptData } from "@/utils/CryptoJS";
import { message, Spin } from "antd";

export default function InfoHeaderLayout() {
   const navigate = useNavigate();
   const { email: encodedEncryptedEmail } = useParams();
   const [isLoading, setIsLoading] = useState(true);

   // Lấy thông tin tài khoản đang đăng nhập từ state/localStorage
   const [accountLogged] = useState(() => {
      const storedData = localStorage.getItem("accountLogged");
      return storedData ? JSON.parse(storedData) : {};
   });

   useEffect(() => {
      if (!accountLogged || !accountLogged.email || !encodedEncryptedEmail) {
         // Không có thông tin đăng nhập hoặc URL bị thiếu, chuyển hướng về trang chủ
         navigate("/user");
         return;
      }

      try {
         // Giải mã URL đã được encodeURIComponent trước đó
         const encryptedEmail = decodeURIComponent(encodedEncryptedEmail);

         // Giải mã email bằng Crypto chuỗi email gốc
         const actualEmail = decryptData(encryptedEmail);

         // Kiểm tra email gốc có khớp với email của người dùng đang đăng nhập không
         if (actualEmail === accountLogged.email) {
            // Email khớp, cho phép hiển thị nội dung
            setIsLoading(false);
         } else {
            message.error(
               "Liên kết không hợp lệ hoặc bạn không có quyền truy cập."
            );
            navigate("/user");
         }
      } catch (error) {
         message.error("Liên kết không hợp lệ.");
         navigate("/user");
      } finally {
         setIsLoading(false);
      }
   }, [accountLogged.email, encodedEncryptedEmail, navigate]);

   if (isLoading) {
      return (
         <div className="fixed inset-0 flex justify-center items-center bg-gray-50">
            <Spin
               fullscreen
               size="large"
               tip="Đang kiểm tra quyền truy cập..."
            />
         </div>
      );
   }

   return (
      <div>
         <InfoHeader className="flex" />
         <div className="flex">
            <InfoMenu />
            <div className="flex-1 p-6">
               <Outlet />
            </div>
         </div>
      </div>
   );
}

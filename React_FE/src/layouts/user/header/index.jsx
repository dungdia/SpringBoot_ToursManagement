import { Avatar, Button, Input, Select } from "antd";
import React from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";
import { encryption } from "@/utils/CryptoJS";

export default function Header() {
   const navigate = useNavigate();

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   // Hàm để lấy các chữ cái đầu của mỗi từ trong tên
   const getInitials = (fullName) => {
      const words = fullName?.split(" "); // Chia tên thành các từ
      const initials = words?.map((word) => word.charAt(0).toUpperCase()); // Lấy chữ cái đầu của mỗi từ và chuyển thành chữ hoa
      return initials?.join(""); // Kết hợp các chữ cái đầu thành chuỗi
   };
   return (
      <>
         <div className="flex items-center justify-between p-5">
            <a href="#">
               <img
                  src="./src/assets/img/logo.png"
                  alt="Logo"
                  className="logo"
               />
            </a>
            <div className="flex items-center justify-between gap-60">
               <div className="flex items-center gap-6">
                  {/* Tìm kiếm */}
                  <div>
                     <Input.Search
                        placeholder="Tìm kiếm chuyến đi..."
                        className="w-[350px]"
                     />
                  </div>
                  {/* Lọc theo sản phẩm */}
                  <div className="flex items-center justify-center gap-3">
                     <p>Lọc khu vực</p>
                     <Select
                        defaultValue="Tất cả"
                        style={{ width: 120 }}
                        options={[
                           { value: "jack", label: "Jack" },
                           { value: "lucy", label: "Lucy" },
                           { value: "Yiminghe", label: "yiminghe" },
                           {
                              value: "disabled",
                              label: "Disabled",
                              disabled: true,
                           },
                        ]}
                     />
                  </div>
                  {/* About */}
                  <div>
                     <p className="cursor-pointer">Giới thiệu</p>
                  </div>
                  {/* Contact us */}
                  <div>
                     <p className="cursor-pointer">
                        <a href="#footer">Liên hệ</a>
                     </p>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <Button type="primary" danger ghost>
                     Qua trang ADMIN
                  </Button>

                  <Avatar
                     onClick={() =>
                        navigate(
                           `/user-info/${encodeURIComponent(
                              encryption(accountLogged.email)
                           )}`
                        )
                     }
                     className="bg-orange-400! cursor-pointer"
                  >
                     {getInitials(accountLogged?.fullName)}
                  </Avatar>
               </div>
            </div>
         </div>
      </>
   );
}

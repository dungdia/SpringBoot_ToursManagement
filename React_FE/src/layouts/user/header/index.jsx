import { Avatar, Button, Input, message, Select } from "antd";
import React, { useContext, useEffect, useState } from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";
import { encryption } from "@/utils/CryptoJS";
import { getAllAreasNotFilter } from "@/services/areaService";
import { HeaderContext } from "@/providers/headerUserProvider";

export default function Header() {
   const { searchValue, setSearchValue, selectedArea, setSelectedArea } =
      useContext(HeaderContext);

   const navigate = useNavigate();

   // Lấy tất cả dữ liệu khu vực
   const [isAreaLoading, setIsAreaLoading] = useState(false);
   const [areas, setAreas] = useState([]);
   const [baseAreaId, setBaseAreaId] = useState(null);

   // lấy giá trị tìm kiếm search
   const [checkValueTour, setCheckValueTour] = useState("");

   // Cập nhật searchValue trong HeaderContext khi checkValueTour thay đổi
   useEffect(() => {
      setSearchValue(checkValueTour);
   }, [checkValueTour, setSearchValue]);

   // Cập nhật setSelectedArea trong HeaderContext khi baseAreaId thay đổi
   useEffect(() => {
      setSelectedArea(baseAreaId);
   }, [baseAreaId, setSelectedArea]);

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   // Hàm để lấy các chữ cái đầu của mỗi từ trong tên
   const getInitials = (fullName) => {
      const words = fullName?.split(" "); // Chia tên thành các từ
      const initials = words?.map((word) => word.charAt(0).toUpperCase()); // Lấy chữ cái đầu của mỗi từ và chuyển thành chữ hoa
      return initials?.join(""); // Kết hợp các chữ cái đầu thành chuỗi
   };

   // Hàm lấy tất cả khu vực
   const fetchAreas = async () => {
      try {
         setIsAreaLoading(true);
         const response = await getAllAreasNotFilter();
         if (response.status === 200) {
            setAreas(response.data);
            setIsAreaLoading(false);
         }
      } catch (error) {
         message.error("Không lấy dữ liệu khu vực. Vui lòng thử lại sau!");
      }
   };

   useEffect(() => {
      fetchAreas();
   }, []);

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
                        placeholder="Tìm kiếm chuyến đi"
                        className="w-[350px]"
                        allowClear
                        value={checkValueTour}
                        onChange={(e) => {
                           setCheckValueTour(e.target.value);
                           if (checkValueTour != null) {
                              // setCurrentPage(1);
                           }
                        }}
                     />
                  </div>
                  {/* Lọc theo sản phẩm */}
                  <div className="flex items-center justify-center gap-3">
                     <p>Lọc khu vực</p>
                     <Select
                        loading={isAreaLoading}
                        defaultValue="all"
                        onChange={(value) => {
                           setBaseAreaId(value); // Cập nhật trạng thái
                           // setCurrentPage(1); // RESET VỀ TRANG 1
                        }} // Cập nhật thể loại
                        style={{ width: 160 }}
                        options={[
                           {
                              value: "all",
                              label: "Tất cả",
                           },

                           ...areas
                              ?.filter((area) => area.status === true)
                              .map((area) => ({
                                 value: area.id,
                                 label: area.areaName,
                              })),
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

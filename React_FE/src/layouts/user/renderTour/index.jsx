import React, { useCallback, useContext, useEffect, useState } from "react";
import "./renderTour.css";
import { getAllTours, getAllToursNotFilter } from "@/services/tourService";
import { Button, Form, message, Modal, Pagination, Spin } from "antd";
import { formatMoney } from "@/utils/vaidate";
import { HeaderContext } from "@/providers/headerUserProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { encryption } from "@/utils/CryptoJS";

// hàm viết hoa chữ cái đầu
const toTitleCase = (str) => {
   if (!str) return "";
   return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
};

export default function RenderTour() {
   const { searchValue, setSearchValue, selectedArea, setSelectedArea } =
      useContext(HeaderContext);

   const navigate = useNavigate();
   const [tours, setTours] = useState([]);
   const [isTourLoading, setIsTourLoading] = useState(false);

   // Phân trang
   const [totalElements, setTotalElements] = useState(0);
   const [currentPage, setCurrentPage] = useState(0);
   const [pageSize, setPageSize] = useState(12);

   // Lấy thông tin đăng nhập từ localStorage
   const accountLogged =
      JSON.parse(localStorage.getItem("accountLogged")) || {};

   // Dùng tải Spin
   const contentStyle = {
      padding: 50,
      background: "rgba(0, 0, 0, 0.05)",
      borderRadius: 4,
   };
   const content = <div style={contentStyle} />;

   // Mong muốn khi sử dụng custome hook useDebounce (delay khi search)
   const debounceSearch = useDebounce(searchValue, 800);

   const fetchTours = useCallback(async () => {
      try {
         setIsTourLoading(true);
         const pageIndex = currentPage - 1;

         const areaId = selectedArea === "all" ? null : selectedArea;
         const response = await getAllTours(
            debounceSearch,
            pageIndex,
            pageSize,
            areaId
         );

         if (response) {
            // Sắp xếp dữ liệu nhận được để đảm bảo các tour có thứ tự nhất quán (optional)
            setTours(response.content);

            setTotalElements(response.totalElements);
         }
      } catch (error) {
         // Hiển thị thông báo lỗi
         message.error("Không tải được dữ liệu. Vui lòng thử lại sau!");
      } finally {
         // Đảm bảo dừng trạng thái loading dù thành công hay thất bại
         setIsTourLoading(false);
      }
   }, [debounceSearch, currentPage, pageSize, selectedArea]);

   useEffect(() => {
      fetchTours();
   }, [fetchTours]);

   // Hàm chọn URL hình ảnh chính (có ID nhỏ nhất)
   const getPrimaryImageUrl = (images) => {
      if (!images || images.length === 0) {
         return "https://via.placeholder.com/400x300?text=No+Image"; // Hình ảnh mặc định
      }

      //  Sắp xếp mảng images theo id tăng dần
      const sortedImages = [...images].sort(
         (a, b) => (a.id || 0) - (b.id || 0)
      );

      //  Chọn phần tử đầu tiên (có id nhỏ nhất)
      return sortedImages[0].url;
   };

   // Hàm chuyển trang
   const handleChangePage = (currentPage, pageSize) => {
      // Cập nhật lại trang hiện tại
      setCurrentPage(currentPage);

      // cập nhật số lượng bảng ghi / trang
      setPageSize(pageSize);
   };

   return (
      <>
         {/* Giao diện render tour */}
         <div className="pt-10 pb-10">
            {isTourLoading ? (
               // Đặt Spin bao quanh một khối div để căn giữa và hiển thị tốt hơn
               <div className="flex justify-center items-center py-20">
                  <Spin tip="Đang tải..." size="large">
                     {content}
                  </Spin>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 mb-10! md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {/* Kiểm tra nếu không có tour nào thì hiển thị thông báo */}
                  {tours.length === 0 ? (
                     <div className="col-span-full text-center py-10 text-gray-500 text-lg">
                        Không tìm thấy tour nào.
                     </div>
                  ) : (
                     tours.map((tour) => {
                        // Lấy URL hình ảnh chính
                        const primaryImageUrl = getPrimaryImageUrl(
                           tour?.images
                        );

                        // Định dạng tên tour (viết hoa chữ cái đầu)
                        const formattedTourName = toTitleCase(tour?.tourName);

                        // Lấy giá trị tour
                        const tourPrice = tour?.dayDetails?.[0]?.price || 0;
                        // Sử dụng hàm formatCurrency nếu bạn có (tốt nhất nên dùng)
                        // Nếu không có, bạn có thể dùng toLocaleString('vi-VN')
                        const formattedPrice = formatMoney(tourPrice);

                        return (
                           <section
                              key={tour.id}
                              className="tour-card p-5! bg-white shadow-xl rounded-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
                           >
                              {/* Phần hình ảnh */}
                              <div className=" wrap-img-tour overflow-hidden rounded-xl mb-4!">
                                 <img
                                    src={primaryImageUrl}
                                    alt={tour?.tourName}
                                    className="img-tour w-full h-48 object-cover"
                                 />
                              </div>

                              {/* Phần nội dung của tour */}
                              <div className=" flex flex-col justify-between h-auto">
                                 {/* Tiêu đề tour */}
                                 <h3
                                    title={formattedTourName}
                                    className="title format font-bold text-xl text-gray-800 mb-3 line-clamp-2"
                                 >
                                    {formattedTourName}
                                 </h3>

                                 {/* Khu vực */}
                                 <h3 className="flex items-center gap-1 text-sm mb-2! mt-2!">
                                    <p className="text-gray-600">Khu vực:</p>
                                    <p className="font-semibold text-lg text-orange-400 line-clamp-1">
                                       {tour?.area?.areaName}
                                    </p>
                                 </h3>

                                 {/* Giá và nút Đặt lịch */}
                                 <div className="flex items-center justify-between mt-2">
                                    {/* Giá */}
                                    <p
                                       title={formattedPrice}
                                       className="format price text-lg text-red-600 font-semibold flex items-baseline"
                                    >
                                       <span className="text-slate-400 mr-1 text-sm font-light">
                                          Giá:
                                       </span>
                                       {formattedPrice}
                                    </p>

                                    {/* Nút Đặt lịch */}
                                    <Button
                                       onClick={() => {
                                          // Kiểm tra Email trước khi mã hóa và điều hướng
                                          if (
                                             !accountLogged ||
                                             !accountLogged.email
                                          ) {
                                             message.warning(
                                                "Vui lòng đăng nhập để đặt lịch tour."
                                             );
                                             // Ví dụ: navigate('/login');
                                             return; // Dừng lại, không thực hiện mã hóa
                                          }

                                          // 2. Kiểm tra tour.id
                                          if (!tour?.id) {
                                             message.error(
                                                "Không tìm thấy chuyến đi này."
                                             );
                                             return;
                                          }

                                          // 3. Tiến hành mã hóa và điều hướng nếu dữ liệu hợp lệ
                                          const encryptedEmail =
                                             encodeURIComponent(
                                                encryption(accountLogged.email)
                                             );
                                          const encryptedTourId =
                                             encodeURIComponent(
                                                encryption(tour.id)
                                             );

                                          navigate(
                                             `/select-tour/${encryptedEmail}/tourid/${encryptedTourId}`
                                          );
                                       }}
                                       size="large"
                                       type="primary"
                                    >
                                       Đặt lịch
                                    </Button>
                                 </div>
                              </div>
                           </section>
                        );
                     })
                  )}
               </div>
            )}
            {/* Giao diện thanh phân */}
            {totalElements <= 12 ? (
               ""
            ) : (
               <div className=" mb-10! flex justify-center items-center ">
                  <div className="w-fit px-3 py-3 border-pagination">
                     <Pagination
                        showSizeChanger
                        total={totalElements}
                        showTotal={(total, range) =>
                           `${range[0]}-${range[1]} of ${total} items`
                        }
                        onChange={handleChangePage}
                        defaultPageSize={pageSize}
                        defaultCurrent={currentPage}
                        pageSizeOptions={[12, 24, 36, 50, 100]}
                     />
                  </div>
               </div>
            )}
         </div>
      </>
   );
}

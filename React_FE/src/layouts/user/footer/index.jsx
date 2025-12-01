import React from "react";
import {
   FacebookOutlined,
   InstagramOutlined,
   MailOutlined,
   PhoneOutlined,
} from "@ant-design/icons";

export default function Footer() {
   // Đã chuyển sang nền sáng (bg-gray-50) và chữ tối (text-gray-900) để làm sáng giao diện.
   return (
      <footer
         id="footerUser"
         className="bg-gray-50 text-gray-900 pt-12 pb-6 mt-16 shadow-2xl"
      >
         <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {/* Cột 1: Logo và Mô tả */}
               <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-yellow-600">
                     TravelHub
                  </h3>
                  <p className="text-sm text-gray-600">
                     Khám phá thế giới với những chuyến đi được lên kế hoạch
                     hoàn hảo. Đặt tour, vé máy bay, và khách sạn dễ dàng.
                  </p>
                  {/* Biểu tượng mạng xã hội với hiệu ứng hover scale */}
                  <div className="flex space-x-4">
                     <a
                        href="#"
                        className="text-gray-700 hover:text-yellow-600 transition transform hover:scale-110 duration-200"
                        title="Facebook"
                     >
                        <FacebookOutlined style={{ fontSize: "24px" }} />
                     </a>
                     <a
                        href="#"
                        className="text-gray-700 hover:text-yellow-600 transition transform hover:scale-110 duration-200"
                        title="Instagram"
                     >
                        <InstagramOutlined style={{ fontSize: "24px" }} />
                     </a>
                     <a
                        href="#"
                        className="text-gray-700 hover:text-yellow-600 transition transform hover:scale-110 duration-200"
                        title="Email"
                     >
                        <MailOutlined style={{ fontSize: "24px" }} />
                     </a>
                  </div>
               </div>

               {/* Cột 2: Dịch vụ */}
               <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-yellow-600 pb-1">
                     Dịch vụ
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Tour Trong Nước
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Tour Quốc Tế
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Vé Máy Bay
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Khách Sạn
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Cột 3: Hỗ trợ */}
               <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-yellow-600 pb-1">
                     Hỗ trợ
                  </h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Liên hệ
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Câu hỏi thường gặp
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Chính sách bảo mật
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:text-yellow-600 transition duration-200"
                        >
                           Điều khoản sử dụng
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Cột 4: Liên hệ */}
               <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-yellow-600 pb-1">
                     Thông tin liên hệ
                  </h4>
                  <address className="space-y-2 text-gray-700 text-sm not-italic">
                     <p>Số 123, Đường ABC, Quận 1, TP. HCM</p>
                     <p className="flex items-center space-x-2">
                        <PhoneOutlined />
                        <span>(028) 123 4567</span>
                     </p>
                     <p className="flex items-center space-x-2">
                        <MailOutlined />
                        <span>support@travelhub.com</span>
                     </p>
                  </address>
               </div>
            </div>

            {/* Dòng Copyright */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center">
               <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} TravelHub. Bảo lưu mọi quyền.
               </p>
            </div>
         </div>
      </footer>
   );
}

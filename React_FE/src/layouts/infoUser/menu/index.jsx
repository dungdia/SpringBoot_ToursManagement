import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import "./menu.css";
import { useState } from "react";
import {
   InfoCircleOutlined,
   LikeOutlined,
   LogoutOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   OrderedListOutlined,
   UserSwitchOutlined,
} from "@ant-design/icons";
import { Button, Menu, message, Modal } from "antd";
import Cookies from "js-cookie";

export default function MenuAdmin() {
   const navigate = useNavigate();

   const [collapsed, setCollapsed] = useState(false);
   const location = useLocation();

   const [isShowModal, setIsShowModal] = useState(false); // đăng xuất

   const params = useParams();
   // Lấy tham số email đã được React Router giải mã URL.
   const rawEmailParam = params.email;

   // MÃ HÓA LẠI tham số này để nó an toàn khi tái sử dụng trong URL mới.
   // Nếu rawEmailParam có dấu '/', nó sẽ được encodeURIComponent() xử lý thành %2F.
   const encodedEmailParam = rawEmailParam
      ? encodeURIComponent(rawEmailParam)
      : "";

   const USER_INFO_ROOT_PATH = `/user-info/${encodedEmailParam}`;

   // Hàm mở modal xác nhận đăng xuất
   const handleShowModal = () => {
      setIsShowModal(true);
   };

   // Hàm đóng modal xác nhận đăng xuất
   const handleCloseModal = () => {
      setIsShowModal(false);
   };

   // Hàm đăng xuất tài khoản
   const handleLogout = () => {
      // Xóa token khỏi cookie
      Cookies.remove("accessToken");
      // Xóa thông tin user khỏi localStorage
      localStorage.removeItem("accountLogged");
      // Chuyển về trang login
      navigate("/login");
      // Đóng modal
      message.success("Đăng xuất thành công");
   };

   const items = [
      {
         key: "1",
         icon: <InfoCircleOutlined />,
         label: (
            <NavLink end to={USER_INFO_ROOT_PATH}>
               <span>Thông tin</span>
            </NavLink>
         ),
      },
      {
         key: "2",
         icon: <UserSwitchOutlined />,
         label: (
            <NavLink to={`${USER_INFO_ROOT_PATH}/change-password`}>
               <span> Đổi mật khẩu</span>
            </NavLink>
         ),
      },
      {
         key: "3",
         icon: <OrderedListOutlined />,
         label: (
            <NavLink to={`${USER_INFO_ROOT_PATH}/order-history`}>
               <span>Hóa đơn</span>
            </NavLink>
         ),
      },
      {
         key: "4",
         icon: <LikeOutlined />,
         label: (
            <NavLink to={`${USER_INFO_ROOT_PATH}/favorite-trip`}>
               <span> Các nơi yêu thích</span>
            </NavLink>
         ),
      },
      {
         key: "5",
         icon: <LogoutOutlined />,
         label: "Đăng xuất",
         onClick: handleShowModal,
      },
   ];

   const toggleCollapsed = () => {
      setCollapsed(!collapsed);
   };
   const menuWidth = collapsed ? "80px" : "220px";

   const getDefaultKey = () => {
      const currentPath = location.pathname;

      if (
         currentPath === USER_INFO_ROOT_PATH ||
         currentPath.match(/^\/user-info\/[^/]+$/)
      ) {
         return "1";
      }

      if (currentPath.startsWith(`${USER_INFO_ROOT_PATH}/change-password`)) {
         return "2";
      }

      if (currentPath.startsWith(`${USER_INFO_ROOT_PATH}/order-history`)) {
         return "3";
      }

      if (currentPath.startsWith(`${USER_INFO_ROOT_PATH}/favorite-trip`)) {
         return "4";
      }
      return "1";
   };

   return (
      <>
         {/* Modal đăng xuất */}
         <Modal
            onCancel={handleCloseModal}
            footer={
               <div className="flex justify-end gap-2">
                  <Button onClick={handleCloseModal} type="primary" ghost>
                     Hủy
                  </Button>
                  <Button onClick={handleLogout} type="primary" danger>
                     Đăng xuất
                  </Button>
               </div>
            }
            title="Xác nhận"
            open={isShowModal}
         >
            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
         </Modal>

         <menu
            id="user-info-menu"
            style={{ width: menuWidth }}
            className="w-fit bg-[#001529] min-h-screen text-white flex flex-col items-start transition-all duration-300 ease-out"
         >
            <div className="mb-3">
               <Menu
                  className="custom-admin-menu "
                  defaultSelectedKeys={[getDefaultKey()]}
                  mode="inline"
                  theme="dark"
                  inlineCollapsed={collapsed}
                  items={items}
               />
            </div>
            <Button
               className="bottom-4 left-4 z-20"
               type="primary"
               onClick={toggleCollapsed}
               style={{
                  marginBottom: 16,
               }}
            >
               {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
         </menu>
      </>
   );
}

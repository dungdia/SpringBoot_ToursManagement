import { NavLink, useLocation } from "react-router-dom";
import "./menu.css";
import { useState } from "react";
import {
   AreaChartOutlined,
   CarOutlined,
   ControlOutlined,
   MenuFoldOutlined,
   MenuUnfoldOutlined,
   OrderedListOutlined,
   UsergroupAddOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import { useAdmin } from "@/providers/adminProvider";

export default function MenuAdmin() {
   const [collapsed, setCollapsed] = useState(false);
   const location = useLocation();

   const { isOwner } = useAdmin();

   const items = [
      {
         key: "1",
         icon: <ControlOutlined />,
         label: (
            <NavLink end to={isOwner ? "/admin" : undefined}>
               <span>Thống kê</span>
            </NavLink>
         ),
         disabled: !isOwner,
         title: isOwner ? "Xem tổng quan hệ thống" : "Chỉ dành cho Chủ sở hữu",
      },
      {
         key: "2",
         icon: <UsergroupAddOutlined />,
         label: (
            <NavLink to={!isOwner ? "/admin" : "/admin/account-manager"}>
               <span> Quản lý tài khoản</span>
            </NavLink>
         ),
      },
      {
         key: "3",
         icon: <CarOutlined />,

         label: (
            <NavLink to="/admin/tour-manager">
               <span> Quản lý tour</span>
            </NavLink>
         ),
      },
      {
         key: "4",
         icon: <AreaChartOutlined />,
         label: (
            <NavLink to="/admin/area-manager">
               <span> Quản lý khu vực</span>
            </NavLink>
         ),
      },
      {
         key: "5",
         icon: <OrderedListOutlined />,
         label: (
            <NavLink to="/admin/order-manager">
               <span> Quản lý đơn đặt tour</span>
            </NavLink>
         ),
      },
   ];

   const toggleCollapsed = () => {
      setCollapsed(!collapsed);
   };
   const menuWidth = collapsed ? "80px" : "237px";

   // Xác định khóa được chọn mặc định dựa trên đường dẫn hiện tại
   const getDefaultKey = () => {
      const routeToKeyMap = {
         "/admin": "1",
         "/admin/account-manager": "2",
         "/admin/tour-manager": "3",
         "/admin/area-manager": "4",
         "/admin/order-manager": "5",
      };
      const currentPath = location.pathname;

      // Ưu tiên khớp với đường dẫn con cụ thể trước (ví dụ: /admin/tour-manager)
      const matchedKey = routeToKeyMap[currentPath];
      if (matchedKey && matchedKey !== "1") {
         return matchedKey;
      }

      // Xử lý đường dẫn gốc /admin (index route)
      if (currentPath === "/admin") {
         if (isOwner) {
            return "1";
         }
         return "2";
      }

      // Nếu không phải OWNER VÀ đường dẫn không khớp, mặc định là key 2
      if (!isOwner) {
         return "2";
      }

      // Trường hợp còn lại mặc định là key 1
      return "1";
   };

   return (
      <>
         <menu
            id="admin-menu"
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

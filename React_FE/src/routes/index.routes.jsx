import { createBrowserRouter, Navigate } from "react-router-dom";

import React from "react";
import LazyLoadComponent from "@/components/base/LazyLoadComponent";
import { AdminProvider, useAdmin } from "@/providers/adminProvider";

// Tải bằng lazy load
// Các route liên quan tới trang admin
const AdminLayout = React.lazy(() => import("@/layouts/admin/AdminLayout"));
const StatisticManager = React.lazy(() =>
   import("@/pages/admin/statisticManager")
);
const AccountManager = React.lazy(() => import("@/pages/admin/accountManager"));
const TourManager = React.lazy(() => import("@/pages/admin/tourManager"));
const OrderManager = React.lazy(() => import("@/pages/admin/orderManager"));
const NotFound = React.lazy(() => import("@/pages/admin/notFound"));

// Các route liên quan tới trang user
const UserLayout = React.lazy(() => import("@/layouts/user/UserLayout"));
const UserInfoLayout = React.lazy(() =>
   import("@/layouts/infoUser/InfoUserLayout")
);
const UserInfo = React.lazy(() => import("@/pages/infoUser/infoUser"));
const ChangePassword = React.lazy(() =>
   import("@/pages/infoUser/changePassword")
);
const Order = React.lazy(() => import("@/pages/infoUser/order"));
const FavoriteTrip = React.lazy(() => import("@/pages/infoUser/favoriteTrip"));

// Các route liên quan tới đăng nhập và đăng xuất
const Login = React.lazy(() => import("@/pages/auth/login"));
const Register = React.lazy(() => import("@/pages/auth/register"));

// Component để xử lý chuyển hướng mặc định dựa trên vai trò người dùng
function AdminRedirectHandler() {
   // Gọi Hook để lấy trạng thái isOwner
   const { isOwner } = useAdmin();

   if (isOwner) {
      // Owner mặc định vào trang Thống kê
      return (
         <LazyLoadComponent>
            <StatisticManager />
         </LazyLoadComponent>
      );
   }
   // Người dùng khác mặc định vào trang Quản lý Tài khoản
   return (
      <LazyLoadComponent>
         <AccountManager />
      </LazyLoadComponent>
   );
}

const routes = createBrowserRouter([
   {
      path: "/",
      element: <Navigate to="/login" />, // Khi truy cập vào URL gốc, chuyển hướng đến trang login
   },
   {
      path: "/login",
      element: (
         <LazyLoadComponent>
            <Login />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/register",
      element: (
         <LazyLoadComponent>
            <Register />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/user",
      element: (
         <LazyLoadComponent>
            <UserLayout />
         </LazyLoadComponent>
      ),
   },
   {
      path: "/user-info/:email",
      element: (
         <LazyLoadComponent>
            <UserInfoLayout />
         </LazyLoadComponent>
      ),
      children: [
         {
            index: true,
            element: (
               <LazyLoadComponent>
                  <UserInfo />
               </LazyLoadComponent>
            ),
         },
         {
            path: "change-password",
            element: (
               <LazyLoadComponent>
                  <ChangePassword />
               </LazyLoadComponent>
            ),
         },
         {
            path: "order-history",
            element: (
               <LazyLoadComponent>
                  <Order />
               </LazyLoadComponent>
            ),
         },
         {
            path: "favorite-trip",
            element: (
               <LazyLoadComponent>
                  <FavoriteTrip />
               </LazyLoadComponent>
            ),
         },
         {
            path: "*",
            element: (
               <LazyLoadComponent>
                  <NotFound />
               </LazyLoadComponent>
            ),
         },
      ],
   },
   {
      path: "/admin",
      element: (
         <AdminProvider>
            <LazyLoadComponent>
               <AdminLayout />
            </LazyLoadComponent>
         </AdminProvider>
      ),
      children: [
         {
            index: true, // mặc định khi vào /admin sẽ hiển thị trang thống kê
            element: <AdminRedirectHandler />,
         },
         {
            path: "account-manager",
            element: (
               <LazyLoadComponent>
                  <AccountManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "tour-manager",
            element: (
               <LazyLoadComponent>
                  <TourManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "order-manager",
            element: (
               <LazyLoadComponent>
                  <OrderManager />
               </LazyLoadComponent>
            ),
         },
         {
            path: "*",
            element: (
               <LazyLoadComponent>
                  <NotFound />
               </LazyLoadComponent>
            ),
         },
      ],
   },
]);

export default routes;

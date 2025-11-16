import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import routes from "./routes/index.routes.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AdminProvider } from "./providers/adminProvider";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function FacebookSDKLoader() {
   useEffect(() => {
      // Chỉ load 1 lần
      window.fbAsyncInit = function () {
         // Sử dụng window.location.origin để lấy URL gốc hiện tại (ví dụ: https://luetta-flawed-kent.ngrok-free.dev)
         // Điều này quan trọng để Facebook SDK biết rằng nó đang chạy trên kết nối bảo mật.
         const currentOrigin = window.location.origin;
         console.log(currentOrigin);

         FB.init({
            appId: import.meta.env.VITE_FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: "v17.0",

            // === BỔ SUNG THAM SỐ BẢO MẬT NÀY ===
            status: true, // Kiểm tra trạng thái đăng nhập
            redirect_uri: currentOrigin, // Khai báo rõ ràng URI chuyển hướng HTTPS
         });
      };

      // Thêm script SDK vào body
      (function (d, s, id) {
         var js,
            fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) return;
         js = d.createElement(s);
         js.id = id;
         js.src = "https://connect.facebook.net/en_US/sdk.js";
         fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
   }, []);

   return null;
}

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <AdminProvider>
         <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <FacebookSDKLoader />
            <RouterProvider router={routes} />
         </GoogleOAuthProvider>
      </AdminProvider>
   </StrictMode>
);

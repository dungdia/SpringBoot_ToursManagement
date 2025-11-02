<!-- Khởi tạo dự án -->
npm create vite@latest,  select javascript + SWC

<!-- Sử dụng các router định tuyến -->
npm i react-router-dom

<!-- Gọi API thay vì dùng fetch -->
npm i axios

<!-- Khá là mạnh trong việc tạo giao diện admin -->
npm i antd

<!-- Sử dụng các style đặc biệt cho antd -->
npm install antd-style

<!-- Sử dụng các components icon không cần nhúng thẻ SVG -->
npm i lucide-react

<!-- 1 tailwind css -->
npm install tailwindcss @tailwindcss/vite

<!-- 1.1 Sau khi cài đặt xong tailwind css, add vào vite.config.js -->
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

<!-- 1.2 @import "tailwindcss"; vào file index.css -->
@import "tailwindcss";

<!-- Sử dụng cookie để lưu token -->
npm i js-cookie

<!-- Sử dụng icon từ ant-desgin -->
npm install @ant-design/icons@5.x --save

<!-- Sử dụng để mã hóa tài khoản -->
npm install crypto-js

<!-- Mã hóa password -->
npm install bcryptjs

<!-- Đăng nhập google và lấy token -->
npm install @react-oauth/google jwt-decode

<!-- Đăng nhập facebook cho các react18 trở lên -->
npm install @greatsumini/react-facebook-login



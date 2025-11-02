import { Spin } from "antd";
import React, { Suspense } from "react";
const contentStyle = {
   padding: 50,
   background: "rgba(0, 0, 0, 0.05)",
   borderRadius: 4,
};
const content = <div style={contentStyle} />;
export default function LazyLoadComponent({ children }) {
   return (
      <Suspense
         fallback={
            <div className="fixed inset-0 flex justify-center items-center">
               <Spin tip="Đang tải..." size="large">
                  {content}
               </Spin>
            </div>
         }
      >
         {children}
      </Suspense>
   );
}

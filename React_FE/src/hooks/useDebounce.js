import { useEffect, useState } from "react";

const useDebounce = (value, timeDelay) => {
   const [debouncedValue, setDebouncedValue] = useState(value);

   useEffect(() => {
      // Tạo timeout và cập nhật debouncedValue sau thời gian trì hoãn
      const timeoutId = setTimeout(() => {
         setDebouncedValue(value);
      }, timeDelay);

      // Cleanup: Xóa timeout nếu value thay đổi hoặc component unmount
      return () => clearTimeout(timeoutId);
   }, [value, timeDelay]); // Chạy lại khi value hoặc timeDelay thay đổi

   return debouncedValue;
};

export { useDebounce };

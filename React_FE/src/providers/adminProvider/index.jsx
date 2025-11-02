import React, {
   createContext,
   useContext,
   useState,
   useCallback,
   useEffect,
} from "react";

const AdminContext = createContext(null);
const ROLE_OWNER = "ROLE_OWNER";

// Hook tùy chỉnh để sử dụng Admin Context
export const useAdmin = () => {
   const context = useContext(AdminContext);
   if (!context) {
      throw new Error("useAdmin phải được sử dụng trong AdminProvider");
   }
   return context;
};

function AdminProvider({ children }) {
   const initializeAccount = () => {
      const storedData = localStorage.getItem("accountLogged");
      try {
         return storedData ? JSON.parse(storedData) : {};
      } catch (e) {
         console.error("Lỗi parse localStorage:", e);
         return {};
      }
   };

   const [accountLogged, setAccountLogged] = useState(initializeAccount);

   const isOwner = accountLogged?.roles?.some((role) => role === ROLE_OWNER);

   const updateAccount = useCallback((newAccountData) => {
      setAccountLogged(newAccountData);
      if (newAccountData && Object.keys(newAccountData).length > 0) {
         localStorage.setItem("accountLogged", JSON.stringify(newAccountData));
      } else {
         localStorage.removeItem("accountLogged");
      }
   }, []);

   useEffect(() => {
      const handleUserUpdate = () => {
         console.log(
            "Dữ liệu user trong localStorage đã được cập nhật. Đang tải lại..."
         );
         const storedData = localStorage.getItem("accountLogged");
         try {
            const newData = storedData ? JSON.parse(storedData) : {};
            setAccountLogged(newData);
         } catch (e) {
            console.error("Lỗi đồng bộ localStorage:", e);
            setAccountLogged({});
         }
      };

      window.addEventListener("userUpdated", handleUserUpdate);

      return () => {
         window.removeEventListener("userUpdated", handleUserUpdate);
      };
   }, []);

   // Giá trị cung cấp qua Context
   const value = {
      accountLogged,
      isOwner,
      updateAccount,
   };

   return (
      <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
   );
}

export { AdminContext, AdminProvider };

import React, { createContext, useState } from "react";

// Tạo context cho Header
const HeaderContext = createContext();

function HeaderUserProvider({ children }) {
   const [searchValue, setSearchValue] = useState("");
   const [selectedArea, setSelectedArea] = useState("all");


   return (
      <HeaderContext.Provider
         value={{
            searchValue,
            setSearchValue,
            selectedArea,
            setSelectedArea,
         }}
      >
         {children}
      </HeaderContext.Provider>
   );
}

export { HeaderContext, HeaderUserProvider };

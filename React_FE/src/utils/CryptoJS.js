import CryptoJS from "crypto-js";
const secretKey = "J2EE-Microservice+React"; // Chìa khóa bí mật để mã hóa
import bcrypt from "bcryptjs"; // Nhớ import bcryptjs

// Hàm mã hóa mật khẩu siêu mạnh không thể giải mã nó
const encryptPassword = async (password) => {
   const salt = await bcrypt.genSalt(10); // Tạo salt với 10 vòng lặp
   const hashedPassword = await bcrypt.hash(password, salt); // Băm mật khẩu với salt
   return hashedPassword;
};

// Hàm mã hóa
const encryption = (encryptedData) => {
   return CryptoJS.AES.encrypt(encryptedData, secretKey).toString();
};

// Hàm giải mã
const decryptData = (encryptedData) => {
   return CryptoJS.AES.decrypt(encryptedData, secretKey).toString(
      CryptoJS.enc.Utf8
   );
};

export { encryption, decryptData, encryptPassword };

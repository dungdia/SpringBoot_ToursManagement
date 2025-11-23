// Hàm kiểm tra định dạng của Tên
const validateName = (value) => {
   const regex =
      /^[a-zA-ZÀÁẠÃẢẶẴẲẮẰÁĂÂẤẪẨẬẦÃÈẼẺẸÉÊẾỀỄỆỂÌÍỈỊIỢỠỚỜỞÕỌỎÒÓỔỖỐỒỘÔÕƯỨỪỰỮỬỤŨỦÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÊƠàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũơớờợởỡăắằặẳẵâấầậẩẫêếềệểễđĩọỏốồộổỗồờớợởẽẹẻếìíùúụũưữựửữữýỳỵỷỹ ]+$/;
   return regex.test(value);
};

// Hàm xử lý Tên
const handleNameChange = (e, setNameStatus) => {
   const name = e.target.value;

   // Cập nhật trạng thái validate
   if (!name) {
      setNameStatus("");
   } else if (validateName(name)) {
      setNameStatus("success");
   } else {
      setNameStatus("error");
   }
};

// Hàm kiểm tra định dạng email
const validateEmail = (email) => {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra email
   return emailRegex.test(email);
};

// Hàm xử lý email
const handleEmailChange = (e, setEmailStatus) => {
   const email = e.target.value;
   // Cập nhật trạng thái validate
   if (!email) {
      setEmailStatus(""); // Reset trạng thái nếu input rỗng
   } else if (validateEmail(email)) {
      setEmailStatus("success"); // Email hợp lệ
   } else {
      setEmailStatus("error"); // Email không hợp lệ
   }
};

// Hàm kiểm tra định dạng của password
const validatePassword = (password) => {
   const regex = /^[A-Za-z0-9]{6,}$/;
   return regex.test(password);
};

// Hàm xử lý password
const handlePasswordChange = (e, setPassStatus) => {
   const password = e.target.value;
   if (!password) {
      setPassStatus("");
   } else if (validatePassword(password)) {
      setPassStatus("success");
   } else {
      setPassStatus("error");
   }
};

// Hàm xử lý onChangeNewPassword
const handleNewPasswordChange = (value, setNewPasswordStatus) => {
   if (!value) {
      setNewPasswordStatus("error");
   } else if (value.length >= 6) {
      setNewPasswordStatus("success");
   } else {
      setNewPasswordStatus("error");
   }
};

// Hàm formatter cho VNĐ
const vietnameseCurrencyFormatter = (value) => {
   if (value === null || value === undefined) {
      return "0 ₫";
   }

   // Tách phần nguyên và phần thập phân
   const [start, end] = `${value}`.split(".");

   // Định dạng phần nguyên với dấu chấm phân cách hàng nghìn
   const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Dùng dấu chấm làm dấu phân cách hàng nghìn

   // Trả về chuỗi đã định dạng kèm theo ký hiệu VNĐ
   return `${end ? `${v},${end}` : `${v}`} ₫`;
};

// Hàm parser
const vietnameseCurrencyParser = (value) => {
   return value?.replace(/\₫\s?|(\.*)/g, ""); // Loại bỏ ₫ và dấu chấm (.)
};

const formatMoney = (money) => {
   return money.toLocaleString("it-IT", { style: "currency", currency: "VND" });
};

export {
   handleNameChange,
   handleEmailChange,
   handlePasswordChange,
   handleNewPasswordChange,
   validateEmail,
   validateName,
   validatePassword,
   vietnameseCurrencyFormatter,
   vietnameseCurrencyParser,
   formatMoney,
};

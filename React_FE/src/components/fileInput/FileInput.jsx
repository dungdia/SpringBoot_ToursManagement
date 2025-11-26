import React, { useEffect } from "react";
import { Input, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

/**
 * Component xử lý input file tùy chỉnh cho Form.List
 */
export default function FileInput({
   fieldName,
   form,
   value,
   onChange,
   ...restProps
}) {
   const fileSelected = value;
   let fileName = fileSelected instanceof File ? fileSelected?.name : null;
   // Lắng nghe sự kiện chọn file
   const handleFileChange = (e) => {
      const file = e.target.files[0];

      if (file) {
         const MAX_SIZE = 50 * 1024 * 1024; // 50MB

         if (file.size > MAX_SIZE) {
            message.error("Kích thước ảnh không được vượt quá 50MB!");
            e.target.value = null;
            // DÙNG onChange() để báo Form.Item cập nhật (về null)
            onChange(null);
            form.setFieldValue(["file_selected", fieldName], null);
            return;
         }

         if (!file.type.startsWith("image/")) {
            message.error("Vui lòng chọn file hình ảnh!");
            e.target.value = null;
            onChange(null);
            form.setFieldValue(["file_selected", fieldName], null);
            return;
         }

         // Lưu vào form
         onChange(file);
         form.setFieldValue(["file_selected", fieldName], file);
      } else {
         onChange(null);
         form.setFieldValue(["file_selected", fieldName], null);
      }

      // Buộc form update
      form.validateFields(["file_selected", fieldName]);
   };

   const triggerFileSelection = () => {
      document.getElementById(`file-input-${fieldName}`).click();
   };

   return (
      <div
         style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            gap: 8,
         }}
      >
         <input
            id={`file-input-${fieldName}`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
         />

         <Input
            placeholder={fileName || "Chưa chọn file"}
            value={fileName}
            readOnly
            onClick={triggerFileSelection}
            style={{ cursor: "pointer", flexGrow: 1 }}
            suffix={
               <Button
                  type="default"
                  icon={<UploadOutlined />}
                  onClick={triggerFileSelection}
                  size="small"
                  style={{ padding: "0 8px" }}
               >
                  Chọn file
               </Button>
            }
         />
      </div>
   );
}

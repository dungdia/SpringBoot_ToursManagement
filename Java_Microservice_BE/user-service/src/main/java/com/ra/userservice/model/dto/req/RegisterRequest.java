package com.ra.userservice.model.dto.req;

import com.ra.userservice.validation.annotation.EmailExist;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class RegisterRequest {
    @NotBlank(message = "tên không được để trống")
    private String fullName;
    @EmailExist
    @NotBlank(message = "email không được để trống")
    @Pattern(regexp = "^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$",message = "email không đúng định dạng")
    private String email;
    @NotBlank(message = "mật khẩu không được để trống")
    private String password;
}

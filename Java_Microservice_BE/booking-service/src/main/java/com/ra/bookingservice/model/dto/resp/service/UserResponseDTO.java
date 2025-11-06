package com.ra.bookingservice.model.dto.resp.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String gender;
    private String phone;
    private String address;
}

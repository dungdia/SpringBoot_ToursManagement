package com.ra.userservice.model.dto.resp.booking;

import com.ra.userservice.constants.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CustomerResponseDTO {
    private Long id;
    private String customerName;
    private Long age;
    private String phone;
    private Gender gender;
}

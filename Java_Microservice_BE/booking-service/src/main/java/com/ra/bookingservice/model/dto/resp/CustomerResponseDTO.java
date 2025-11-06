package com.ra.bookingservice.model.dto.resp;

import com.ra.bookingservice.constants.Gender;
import com.ra.bookingservice.model.dto.resp.service.DayDetailResponseDTO;
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

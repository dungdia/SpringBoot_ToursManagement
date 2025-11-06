package com.ra.bookingservice.model.dto.req;

import com.ra.bookingservice.constants.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CustomerRequestDTO {
    private String customerName;
    private Long age;
    private String phone;
    private Gender gender;
}

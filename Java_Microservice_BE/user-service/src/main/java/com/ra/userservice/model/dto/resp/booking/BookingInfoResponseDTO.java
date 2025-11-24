package com.ra.userservice.model.dto.resp.booking;

import com.ra.userservice.constants.StatusBooking;
import com.ra.userservice.model.dto.resp.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BookingInfoResponseDTO {
    private Long id;
    private UserResponse user;
    private List<CustomerResponseDTO> customers;
    private DayDetailResponseDTO dayDetail;
    private StatusBooking status;
}

package com.ra.bookingservice.model.dto.resp;

import com.ra.bookingservice.constants.Status;
import com.ra.bookingservice.model.dto.resp.service.DayDetailResponseDTO;
import com.ra.bookingservice.model.dto.resp.service.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BookingResponseDTO {
    private Long id;
    private UserResponseDTO user;
    private List<CustomerResponseDTO> customers;
    private DayDetailResponseDTO dayDetail;
    private Status status;
}

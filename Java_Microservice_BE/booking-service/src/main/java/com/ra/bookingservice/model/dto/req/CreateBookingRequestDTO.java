package com.ra.bookingservice.model.dto.req;

import com.ra.bookingservice.constants.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class CreateBookingRequestDTO {
    private Long userId;
    private Long dayDetailId;
    private List<CustomerRequestDTO> customers;
    private Status status;
}

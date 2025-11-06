package com.ra.bookingservice.model.dto.req;

import com.ra.bookingservice.constants.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UpdateBookingRequestDTO
{
    private Status status;
}

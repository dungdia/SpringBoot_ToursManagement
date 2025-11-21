package com.ra.tourservice.service.impl;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.service.ITourToBookingServiceCommunication;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@AllArgsConstructor
public class TourToBookingServiceCommunicationImpl implements ITourToBookingServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String BOOKING_SERVICE_URL = "http://BOOKING-SERVICE/api/v1/";

    @Override
    public Boolean checkIfTourIsUsedInBooking(Long tourId) throws CustomException {
        String url = BOOKING_SERVICE_URL + "admin/bookings/tours/" + tourId + "/check";
        try {
            return restTemplate.getForObject(url, Boolean.class);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi kiểm tra Tour có được sử dụng trong Booking Service: " + ex.getMessage());
        }
    }
}

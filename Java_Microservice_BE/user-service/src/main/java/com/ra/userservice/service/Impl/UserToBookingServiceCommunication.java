package com.ra.userservice.service.Impl;

import com.ra.userservice.exception.CustomException;
import com.ra.userservice.service.IUserToBookingServiceCommunication;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@AllArgsConstructor
public class UserToBookingServiceCommunication implements IUserToBookingServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String BOOKING_SERVICE_URL = "http://BOOKING-SERVICE/api/v1/";
    @Override
    public Boolean checkIfUserIsUsedBooking(Long userId) throws CustomException {
        String url = BOOKING_SERVICE_URL + "admin/bookings/users/" + userId + "/check";
        try {
            return restTemplate.getForObject(url, Boolean.class);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi kiểm tra User có được sử dụng trong Booking Service: " + ex.getMessage());
        }
    }
}

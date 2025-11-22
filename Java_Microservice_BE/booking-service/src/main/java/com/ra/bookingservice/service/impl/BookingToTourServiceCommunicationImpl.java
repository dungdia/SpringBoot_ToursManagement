package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.service.IBookingToTourServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingToTourServiceCommunicationImpl implements IBookingToTourServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String DAY_DETAIL_IN_TOUR_SERVICE_URL = "http://TOUR-SERVICE/api/v1/";
    @Override
    public List<Long> getDayDetailIdsByTourId(Long tourId) throws CustomException {
        String url = DAY_DETAIL_IN_TOUR_SERVICE_URL + "admin/tours/" + tourId + "/dayDetailIds";
        try {
            Long[] dayDetailIdsArray = restTemplate.getForObject(url, Long[].class);
            assert dayDetailIdsArray != null;
            return List.of(dayDetailIdsArray);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi lấy Day-Detail IDs từ Tour Service: " + ex.getMessage());
        }
    }
}

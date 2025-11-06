package com.ra.bookingservice.service.impl;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.resp.service.DayDetailResponseDTO;
import com.ra.bookingservice.service.ISlotToDayDetailServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class SlotToDayDetailServiceCommunicationImpl implements ISlotToDayDetailServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String DAY_DETAIL_IN_TOUR_SERVICE_URL = "http://TOUR-SERVICE/api/v1/";

    @Override
    public DayDetailResponseDTO getDayDetailById(Long dayDetailId) throws CustomException {
        String url = DAY_DETAIL_IN_TOUR_SERVICE_URL + "admin/tours/dayDetail/" + dayDetailId;
        try {
            return restTemplate.getForObject(url, DayDetailResponseDTO.class);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi gọi Day-Detail trong Tour Service: " + ex.getMessage());
        }
    }

    @Override
    public void deductSlot(Long dayDetailId, Long quantity) throws CustomException {
        String url = DAY_DETAIL_IN_TOUR_SERVICE_URL + "admin/tours/dayDetails/deductSlots/" + dayDetailId + "/" + quantity;
        try {
            restTemplate.put(url, null);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi khấu trừ slots trong Day-Detail của Tour Service: " + ex.getMessage());
        }
    }
}

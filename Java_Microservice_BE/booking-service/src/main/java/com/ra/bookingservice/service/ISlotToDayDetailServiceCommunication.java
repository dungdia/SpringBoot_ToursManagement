package com.ra.bookingservice.service;

import com.ra.bookingservice.exception.CustomException;
import com.ra.bookingservice.model.dto.resp.service.DayDetailResponseDTO;

import java.util.List;

public interface ISlotToDayDetailServiceCommunication {
    DayDetailResponseDTO getDayDetailById(Long dayDetailId) throws CustomException;
    void deductSlot(Long dayDetailId, Long quantity) throws CustomException;
}

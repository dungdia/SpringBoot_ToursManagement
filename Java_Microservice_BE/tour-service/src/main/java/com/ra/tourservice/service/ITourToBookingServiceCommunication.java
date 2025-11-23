package com.ra.tourservice.service;

import com.ra.tourservice.exception.CustomException;

public interface ITourToBookingServiceCommunication
{
    Boolean checkIfTourIsUsedInBooking(Long tourId) throws CustomException;
    Boolean checkIfDayDetailInTourIsUsed(Long dayDetailId) throws CustomException;
}

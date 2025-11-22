package com.ra.tourservice.service;

import java.util.List;

public interface ITourToBookingService {
    List<Long> getDayDetailIdsByTourId(Long tourId);
}

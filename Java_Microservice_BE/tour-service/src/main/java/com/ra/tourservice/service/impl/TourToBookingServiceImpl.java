package com.ra.tourservice.service.impl;

import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Tours;
import com.ra.tourservice.repository.ITourRepository;
import com.ra.tourservice.service.ITourToBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class TourToBookingServiceImpl implements ITourToBookingService {
    private final ITourRepository tourRepository;

    @Override
    public List<Long> getDayDetailIdsByTourId(Long tourId) {
        Tours tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour có Id là: " + tourId));

        return tour.getDayDetails().stream()
                .map(DayDetails::getId)
                .collect(Collectors.toList());
    }
}

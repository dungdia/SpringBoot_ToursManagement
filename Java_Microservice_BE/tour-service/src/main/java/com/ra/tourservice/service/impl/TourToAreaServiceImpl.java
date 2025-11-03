package com.ra.tourservice.service.impl;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.repository.ITourRepository;
import com.ra.tourservice.service.ITourToAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TourToAreaServiceImpl implements ITourToAreaService {
    private final ITourRepository tourRepository;
    @Override
    public Boolean checkIfAreaIsUsed(Long areaId) {
        Long count = tourRepository.countByAreaId(areaId);
        return count != null && count > 0;
    }

    @Override
    public Boolean existsByAreaId(Long areaId) throws CustomException {
        return  tourRepository.existsByAreaId(areaId);
    }
}

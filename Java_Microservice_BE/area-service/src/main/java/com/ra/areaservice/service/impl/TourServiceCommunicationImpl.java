package com.ra.areaservice.service.impl;

import com.ra.areaservice.service.ITourServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class TourServiceCommunicationImpl implements ITourServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String TOUR_SERVICE_URL = "http://TOUR-SERVICE/api/v1/";

    @Override
    public Boolean checkIfAreaIsUsedInTour(Long areaId) {
        String url = TOUR_SERVICE_URL +"admin/tours/"+ "areas/"+ areaId+"/check" ;
        return restTemplate.getForObject(url, Boolean.class);
    }

    @Override
    public Boolean existsToursByAreaId(Long areaId) {
        String url = TOUR_SERVICE_URL+"admin/tours/"+ areaId + "/tours" ;
        return restTemplate.getForObject(url, Boolean.class);
    }
}

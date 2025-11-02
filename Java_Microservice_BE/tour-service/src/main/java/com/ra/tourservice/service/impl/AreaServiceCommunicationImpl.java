package com.ra.tourservice.service.impl;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.resp.AreaResponseDTO;
import com.ra.tourservice.service.IAreaServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AreaServiceCommunicationImpl implements IAreaServiceCommunication {
    private final RestTemplate restTemplate;
    private static final String AREA_SERVICE_URL = "http://AREA-SERVICE/api/v1/";

    @Override
    public AreaResponseDTO getAreaById(Long areaId) throws CustomException {
        String url = AREA_SERVICE_URL + "admin/areas/" + areaId;
        try {
            return restTemplate.getForObject(url, AreaResponseDTO.class);
        } catch (Exception ex) {
            throw new CustomException("Lỗi khi gọi Area Service: " + ex.getMessage());
        }
    }
}

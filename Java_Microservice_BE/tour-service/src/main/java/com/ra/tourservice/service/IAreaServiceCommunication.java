package com.ra.tourservice.service;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.resp.AreaResponseDTO;

public interface IAreaServiceCommunication {
    AreaResponseDTO getAreaById(Long areaId) throws CustomException;
}

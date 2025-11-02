package com.ra.areaservice.service;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.entity.Areas;

import java.util.List;

public interface IAreaService {
    List<Areas> findAll();
    Areas save(AreaRequestDTO areaRequestDTO) throws CustomException;
    Areas findById(Long areaId) throws CustomException;
    Areas update(AreaRequestDTO areaRequestDTO, Long areaId) throws CustomException;
}

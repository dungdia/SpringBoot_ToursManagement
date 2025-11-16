package com.ra.areaservice.service;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.dto.resp.AreaResponseDTO;
import com.ra.areaservice.model.entity.Areas;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAreaService {
    List<AreaResponseDTO> findAll();
    Page<AreaResponseDTO> findAllWithFilters(String search, Boolean statusArea,Pageable pageable);
    Areas save(AreaRequestDTO areaRequestDTO) throws CustomException;
    Areas findById(Long areaId) throws CustomException;
    Areas update(AreaRequestDTO areaRequestDTO, Long areaId) throws CustomException;
    void deleteById(Long areaId) throws CustomException;
    void openBlockArea(Long id) throws CustomException;
}

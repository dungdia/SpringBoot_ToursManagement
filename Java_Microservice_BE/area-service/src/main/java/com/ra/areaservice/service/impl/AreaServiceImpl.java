package com.ra.areaservice.service.impl;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.entity.Areas;
import com.ra.areaservice.repository.IAreaRepository;
import com.ra.areaservice.service.IAreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements IAreaService {
    private final IAreaRepository areaRepository;

// Lấy toàn bộ khu vực không phân trang
    @Override
    public List<Areas> findAll() {
        return areaRepository.findAll();
    }

    @Override
    public Areas save(AreaRequestDTO areaRequestDTO) throws CustomException {
        if(areaRepository.existsByAreaName(areaRequestDTO.getAreaName())){
            throw new CustomException("Tên khu vực đã tồn tại");
        }
        return areaRepository.save(requestToEntity(areaRequestDTO));
    }

    @Override
    public Areas findById(Long areaId) throws CustomException {
        return areaRepository.findById(areaId)
                .orElseThrow(() -> new CustomException("Khu vực không tồn tại"));
    }

    @Override
    public Areas update(AreaRequestDTO areaRequestDTO, Long areaId) throws CustomException {
        // Tìm khu vực dựa trên ID
        Areas area = findById(areaId);

        // Kiểm tra tên khu vực chỉ khi tên thực sự thay đổi
        if(areaRequestDTO.getAreaName() != null
                && !areaRequestDTO.getAreaName().equals(area.getAreaName()))
        {
            // Kiểm tra nếu tên mới có bị trùng với tên khu vực khác không
            if(areaRepository.existsByAreaName(areaRequestDTO.getAreaName())){
                throw new CustomException("Tên khu vực đã tồn tại");
            }
            area.setAreaName(areaRequestDTO.getAreaName());
        }

        // Chỉ cập nhật trạng thái nếu có thay đổi
        if(areaRequestDTO.getStatus() != null &&   !areaRequestDTO.getStatus().equals(area.getStatus()))
        {
            area.setStatus(areaRequestDTO.getStatus());
        }
        return areaRepository.save(area);
    }

    public Areas requestToEntity(AreaRequestDTO areaRequestDTO)
    {
        return Areas.builder()
                .areaName(areaRequestDTO.getAreaName())
                .status(true)
                .build();
    }
}

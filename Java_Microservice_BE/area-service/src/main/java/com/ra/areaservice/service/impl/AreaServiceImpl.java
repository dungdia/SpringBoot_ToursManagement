package com.ra.areaservice.service.impl;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.entity.Areas;
import com.ra.areaservice.repository.IAreaRepository;
import com.ra.areaservice.service.IAreaService;
import com.ra.areaservice.service.ITourServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements IAreaService {
    private final IAreaRepository areaRepository;
    private final ITourServiceCommunication tourServiceCommunication;

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

        // Chỉ cập nhật trạng thái nếu có thay đổi và khu vực không được sử dụng trong bảng Tours
        boolean isUsed = tourServiceCommunication.existsToursByAreaId(areaId);
        if(isUsed){
            area.setStatus(true);
        }else {
            if(areaRequestDTO.getStatus() != null &&   !areaRequestDTO.getStatus().equals(area.getStatus()))
            {
                area.setStatus(areaRequestDTO.getStatus());
            }
        }
        return areaRepository.save(area);
    }

    @Override
    public void deleteById(Long areaId) throws CustomException {
        Areas area = findById(areaId);
        // Kiểm tra xem khu vực có được sử dụng trong bảng Tours hay không
        boolean isUsed = tourServiceCommunication.existsToursByAreaId(areaId);
        if (isUsed) {
            throw new CustomException("Không thể xóa Area (ID: " + areaId + ") vì nó đang được Tour sử dụng.");
        }
        if(area.getStatus()){
            area.setStatus(false);
            areaRepository.save(area);
            throw new CustomException("Đã khóa khu vực thành công. Vui lòng xóa lại để xoá khu vực này.");
        }

        areaRepository.delete(area);
    }

    public Areas requestToEntity(AreaRequestDTO areaRequestDTO)
    {
        return Areas.builder()
                .areaName(areaRequestDTO.getAreaName())
                .status(true)
                .build();
    }
}

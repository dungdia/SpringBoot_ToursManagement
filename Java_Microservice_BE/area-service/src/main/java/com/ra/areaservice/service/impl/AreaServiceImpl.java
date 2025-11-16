package com.ra.areaservice.service.impl;

import com.ra.areaservice.exception.CustomException;
import com.ra.areaservice.model.dto.req.AreaRequestDTO;
import com.ra.areaservice.model.dto.resp.AreaResponseDTO;
import com.ra.areaservice.model.entity.Areas;
import com.ra.areaservice.repository.IAreaRepository;
import com.ra.areaservice.service.IAreaService;
import com.ra.areaservice.service.ITourServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements IAreaService {
    private final IAreaRepository areaRepository;
    private final ITourServiceCommunication tourServiceCommunication;

// Lấy toàn bộ khu vực không phân trang
    @Override
    public List<AreaResponseDTO> findAll() {
        List<Areas> areas = areaRepository.findAll();
        List<AreaResponseDTO> dto = new ArrayList<>();
        AreaResponseDTO areaResponseDTO;

        for (Areas area : areas) {

            // kiểm tra xem Area có được sử dụng trong Tour không
            Boolean isUsedInTour = tourServiceCommunication.checkIfAreaIsUsedInTour(area.getId());

            areaResponseDTO = AreaResponseDTO.builder()
                    .id(area.getId())
                    .areaName(area.getAreaName())
                    .status(area.getStatus())
                    .isTour(isUsedInTour)
                    .build();

            dto.add(areaResponseDTO);
        }

        return dto;
    }

    @Override
    public Page<AreaResponseDTO> findAllWithFilters(String search, Boolean statusArea,Pageable pageable) {
        Page<Areas> areasPage = areaRepository.findAllWithFilters(search, statusArea, pageable);

        return areasPage.map(area -> {
            Boolean isUsedInTour = tourServiceCommunication.checkIfAreaIsUsedInTour(area.getId());
            return AreaResponseDTO.builder()
                    .id(area.getId())
                    .areaName(area.getAreaName())
                    .status(area.getStatus())
                    .isTour(isUsedInTour) // Kiểm tra xem Area có được sử dụng trong Tour không
                    .build();
        });
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
        // Chỉ cập nhật trạng thái nếu có thay đổi và khu vực không được sử dụng trong bảng Tours
        Boolean isUsed = tourServiceCommunication.existsToursByAreaId(areaId);
        // Kiểm tra tên khu vực chỉ khi tên thực sự thay đổi
        if(areaRequestDTO.getAreaName() != null
                && !areaRequestDTO.getAreaName().equals(area.getAreaName()))
        {
            if(isUsed){
                throw new CustomException("Không thể đổi tên khu vực vì nó đang được Tour sử dụng.");
            }
            // Kiểm tra nếu tên mới có bị trùng với tên khu vực khác không
            if(areaRepository.existsByAreaName(areaRequestDTO.getAreaName())){
                throw new CustomException("Tên khu vực đã tồn tại");
            }
            area.setAreaName(areaRequestDTO.getAreaName());
        }

        // Kiểm tra nếu trạng thái được thay đổi thành false và khu vực đang được sử dụng trong Tour
        if (areaRequestDTO.getStatus() != null
                && !areaRequestDTO.getStatus().equals(area.getStatus())) {
            if (!areaRequestDTO.getStatus() && isUsed) {
                throw new CustomException("Không thể thay đổi trạng thái khu vực thành không hoạt động vì nó đang được Tour sử dụng.");
            }
            area.setStatus(areaRequestDTO.getStatus());
        }
        return areaRepository.save(area);
    }

    @Override
    public void deleteById(Long areaId) throws CustomException {
        Areas area = findById(areaId);
        // Kiểm tra xem khu vực có được sử dụng trong bảng Tours hay không
        Boolean isUsed = tourServiceCommunication.checkIfAreaIsUsedInTour(areaId);
        if (isUsed) {
            throw new CustomException("Không thể khóa Area (ID: " + areaId + ") vì nó đang được Tour sử dụng.");
        }
        if(area.getStatus()){
            area.setStatus(false);
            areaRepository.save(area);
            throw new CustomException("Đã khóa khu vực thành công. Vui lòng xóa lại để xoá khu vực này.");
        }

        areaRepository.delete(area);
    }

    @Override
    public void openBlockArea(Long id) throws CustomException {
        Areas area = findById(id);
        if(area == null){
            throw new CustomException("Khu vực không tồn tại");
        }
        if(area.getStatus()){
            throw new CustomException("Khu vực vẫn hoạt động");
        }else {
            area.setStatus(true);
            areaRepository.save(area);
        }
    }

    public Areas requestToEntity(AreaRequestDTO areaRequestDTO)
    {
        return Areas.builder()
                .areaName(areaRequestDTO.getAreaName())
                .status(true)
                .build();
    }
}

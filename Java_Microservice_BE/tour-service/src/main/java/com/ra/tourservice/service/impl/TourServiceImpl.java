package com.ra.tourservice.service.impl;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.req.TourRequestDTO;
import com.ra.tourservice.model.dto.req.UpdateTourRequestDTO;
import com.ra.tourservice.model.dto.resp.AreaResponseDTO;
import com.ra.tourservice.model.dto.resp.TourResponseDTO;
import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Images;
import com.ra.tourservice.model.entity.Tours;
import com.ra.tourservice.repository.IDayDetailRepository;
import com.ra.tourservice.repository.IImageRepository;
import com.ra.tourservice.repository.ITourRepository;
import com.ra.tourservice.service.IAreaServiceCommunication;
import com.ra.tourservice.service.ITourService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourServiceImpl implements ITourService {
    private final ITourRepository tourRepository;
    private final IDayDetailRepository dayDetailRepository;
    private final IImageRepository imageRepository;
//    Gọi qua service Area
    private final IAreaServiceCommunication areaServiceCommunication;

    @Override
    public List<TourResponseDTO> findAll() {
//       Lấy tất cả Tours
        List<Tours> tours = tourRepository.findAll();
        List<TourResponseDTO> responseDTO = new ArrayList<>();
        for(Tours tour: tours){
            try {
                // Ánh xạ từng Tours sang TourResponseDTO
                TourResponseDTO tourResponseDTO = mapEntityToResponseDTO(tour);
                responseDTO.add(tourResponseDTO);
            } catch (CustomException e) {
                // Xử lý lỗi nếu cần, ví dụ: ghi log hoặc bỏ qua tour này
                throw new RuntimeException("Lỗi khi ánh xạ Tour ID: " + tour.getId() + " - " + e.getMessage());
            }
        }
        return responseDTO;
    }


//    Thêm mới 1 Tour
    @Override
    public TourResponseDTO save(TourRequestDTO tourRequestDTO) throws CustomException {
        try {
            Long areaId = tourRequestDTO.getAreaId();
            if (areaId == null) {
                throw new CustomException("Area ID không được để trống!");
            }

            AreaResponseDTO area = areaServiceCommunication.getAreaById(areaId);
            if (area == null || !area.getStatus()) {
                throw new CustomException("Area (ID: " + areaId + ") không tồn tại hoặc không hoạt động.");
            }

            Tours tours = requestToEntity(tourRequestDTO);
            List<DayDetails> details = tours.getDayDetails();

            if (details == null || details.isEmpty()) {
                throw new CustomException("Danh sách chi tiết ngày không được để trống!");
            }

            // Kiểm tra ngày đi ≤ ngày về và không trùng nhau trong cùng 1 request
            for (int i = 0; i < details.size(); i++) {
                DayDetails current = details.get(i);

                // Kiểm tra ngày đi ≤ ngày về
                if (current.getDepartureDate().after(current.getReturnDate())) {
                    throw new CustomException("Ngày khởi hành phải nhỏ hơn hoặc bằng ngày trả về!");
                }

                // Kiểm tra trùng với các phần tử còn lại trong request
                for (int j = i + 1; j < details.size(); j++) {
                    DayDetails compare = details.get(j);
                    if (isSameDay(current.getDepartureDate(),compare.getDepartureDate()) &&
                            isSameDay(current.getReturnDate(),compare.getReturnDate())) {
                        throw new CustomException("Ngày khởi hành: "+formatDate(current.getDepartureDate())+
                                " và ngày trả về: "+formatDate(current.getReturnDate())+" bị trùng nhau!");
                    }
                }

                // Set status = true cho mỗi DayDetail
                current.setStatus(true);
                current.setTour(tours); // thiết lập quan hệ cha-con
            }
//            Lưu và Ánh xạ sang DTO trả về
            Tours savedTour = tourRepository.save(tours);
            return mapEntityToResponseDTO(savedTour);

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException("Cập nhật ngày bị lỗi: " + e.getMessage());
        }
    }

    @Override
    public Tours findById(Long tourId) throws CustomException {
        return tourRepository.findById(tourId)
                .orElseThrow(() -> new CustomException("Không tìm thấy Ngày có Id là:  " + tourId));
    }

//    Thêm DayDetails vào Tour đã có sẵn
    @Override
    public Tours saveDayDetails(TourRequestDTO tourRequestDTO, Long tourId) throws CustomException {
        try {
            Tours tour = findById(tourId);

            // Nếu chưa có danh sách dayDetails thì khởi tạo
            if (tour.getDayDetails() == null) {
                tour.setDayDetails(new ArrayList<>());
            }

//            Lấy danh sách DayDetails hiện tại
            List<DayDetails> existingDetails = tour.getDayDetails();
//            Lấy danh sách DayDetails mới từ DTO
            List<DayDetails> newDetails = tourRequestDTO.getDayDetails();

            if (newDetails != null && !newDetails.isEmpty()) {
                for (DayDetails detail : newDetails) {

                    // Kiểm tra ngày đi <= ngày về
                    if (detail.getDepartureDate().after(detail.getReturnDate())) {
                        throw new CustomException("Ngày khởi hành phải nhỏ hơn hoặc bằng ngày trả về!");
                    }

                    // Kiểm tra trùng ngày (departure hoặc return)
                    boolean isDuplicate = existingDetails.stream().anyMatch(existing ->
                            isSameDay(existing.getDepartureDate(), detail.getDepartureDate()) &&
                                    isSameDay(existing.getReturnDate(), detail.getReturnDate())
                    );

                    if (isDuplicate) {
                        throw new CustomException("Ngày khởi hành: "+formatDate(detail.getDepartureDate())+
                                " và ngày trả về: "+formatDate(detail.getReturnDate())+" bị trùng nhau với ngày khác!");
                    }

                    // Set status = true cho các DayDetail mới
                    detail.setStatus(true);
                    detail.setTour(tour); // thiết lập quan hệ cha-con
                    existingDetails.add(detail); // chỉ add nếu không trùng
                }
            }

            return tourRepository.save(tour);

        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            throw new CustomException("Cập nhật ngày bị lỗi: " + e.getMessage());
        }
    }

//    Thêm Images vào Tour đã có sẵn
@Override
public Tours saveImages(TourRequestDTO tourRequestDTO, Long tourId) throws CustomException {
    Tours tour = findById(tourId);
    Set<String> newImageUrls = tourRequestDTO.getImages();

    // Kiểm tra xem có URL hình ảnh mới nào để thêm không
    if (newImageUrls == null || newImageUrls.isEmpty()) {
        return tour; // Không có gì để làm, trả về tour hiện tại
    }
//    Lấy tập hợp Images hiện tại
    Set<Images> existingImages = tour.getImages();

//    Tạo tập hợp URL từ Images hiện tại để kiểm tra trùng lặp
    Set<String> existingUrls = existingImages.stream()
            .map(Images::getUrl)
            .collect(Collectors.toSet());

//    Lọc ra các URL mới không trùng lặp
    Set<String> uniqueNewUrls = newImageUrls.stream()
            .filter(url -> !existingUrls.contains(url))
            .collect(Collectors.toSet());

//    Nếu không có URL mới nào là duy nhất, ném ngoại lệ
    if (uniqueNewUrls.isEmpty()) {
        throw new CustomException("Tất cả các URL hình ảnh bạn muốn thêm đã tồn tại trong Tour này.");
    }

    // Chuyển đổi URL thành Entities Images mới (Transient)
    Set<Images> uniqueNewImageEntities = mapImages(uniqueNewUrls);

    existingImages.addAll(uniqueNewImageEntities);

    // Lưu Tour (Hibernate tự động xử lý các Entity con liên quan)
    return tourRepository.save(tour);
}


    @Override
    public Tours updateDayDetail(UpdateTourRequestDTO updateTourRequestDTO, Long tourId, Long dayDetailId)
            throws CustomException
    {
        // Tìm DayDetail hiện tại
        DayDetails existingDetail = findDayDetailById(tourId, dayDetailId);
        // Lấy DayDetail từ DTO
        DayDetails incomingDetail = updateTourRequestDTO.getDayDetail();
        // Tải tất cả chi tiết ngày của Day cha (bao gồm cả existingDetail)
        List<DayDetails> siblingDetails = findDayDetailByTourId(tourId);

            // Cập nhật các trường khác null và thưc sự khác biệt
            // Cập nhật Ngày Khởi hành
            if (incomingDetail.getDepartureDate() != null &&
                    !incomingDetail.getDepartureDate().equals(existingDetail.getDepartureDate())) {

                existingDetail.setDepartureDate(incomingDetail.getDepartureDate());
            }

            // Cập nhật Ngày Trả về (Đã sửa lỗi cú pháp/logic)
            if (incomingDetail.getReturnDate() != null &&
                    !incomingDetail.getReturnDate().equals(existingDetail.getReturnDate())) {

                existingDetail.setReturnDate(incomingDetail.getReturnDate());
            }

        // Kiểm tra điều kiện ngày đi ≤ ngày về
        if (existingDetail.getDepartureDate().after(existingDetail.getReturnDate())) {
            throw new CustomException("Ngày khởi hành (" + formatDate(existingDetail.getDepartureDate()) +
                    ") phải nhỏ hơn hoặc bằng ngày trả về (" + formatDate(existingDetail.getReturnDate()) + ")!");
        }

        // Kiểm tra trùng ngày với các DayDetails CÒN LẠI trong cùng Days
        for (DayDetails sibling : siblingDetails) {
            // Lọc bỏ chính bản ghi đang được cập nhật
            if (!sibling.getId().equals(existingDetail.getId())) {

                // Kiểm tra trùng ngày khởi hành HOẶC ngày trả về
                if (isSameDay(sibling.getDepartureDate(), existingDetail.getDepartureDate()) &&
                        isSameDay(sibling.getReturnDate(), existingDetail.getReturnDate())) {

                    throw new CustomException("Ngày khởi hành: "+formatDate(existingDetail.getDepartureDate())+
                            " và ngày trả về: "+formatDate(existingDetail.getReturnDate())+" bị trùng nhau!");
                }
            }
        }

            // Cập nhật Giá
            if (incomingDetail.getPrice() != null &&
                    !incomingDetail.getPrice().equals(existingDetail.getPrice())) {

                existingDetail.setPrice(incomingDetail.getPrice());
            }

            // Cập nhật Trạng thái (Status)
            if (incomingDetail.getStatus() != null &&
                    !incomingDetail.getStatus().equals(existingDetail.getStatus())) {

                existingDetail.setStatus(incomingDetail.getStatus());
            }

            // Lưu DayDetail đã cập nhật (JPA tự động cập nhật)
            dayDetailRepository.save(existingDetail);

            // Trả về Day cha sau khi cập nhật
            return existingDetail.getTour();
    }

    @Override
    public Tours updateImages(UpdateTourRequestDTO updateTourRequestDTO, Long tourId, Long imageId) throws CustomException {
        Tours tour = findById(tourId);
        Set<Images> existingImages = tour.getImages(); // Lấy tập hợp Images hiện tại

        // Tìm hình ảnh cần cập nhật
        Images imageToUpdate = existingImages.stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new CustomException("Không tìm thấy hình ảnh có Id là: " + imageId));

        // Lấy URL mới từ DTO
        String newUrl = updateTourRequestDTO.getImage();

        // Kiểm tra nếu URL mới khác với URL hiện tại
        if (newUrl != null && !newUrl.equals(imageToUpdate.getUrl())) {
            // Kiểm tra trùng lặp URL trong cùng Tour
            boolean isDuplicate = existingImages.stream()
                    .anyMatch(img -> img.getUrl().equals(newUrl));

            if (isDuplicate) {
                throw new CustomException("URL hình ảnh mới đã tồn tại trong Tour này.");
            }

            // Cập nhật URL
            imageToUpdate.setUrl(newUrl);
        }

        // Lưu Tour
        tourRepository.save(tour);

        return tour;
    }

    //    Lấy DayDetail theo TourId và DayDetailId
    @Override
    public DayDetails findDayDetailById(Long tourId, Long dayDetailId) throws CustomException {
        Tours tour = findById(tourId);
        return dayDetailRepository.findByIdAndTour(dayDetailId, tour)
                .orElseThrow(() -> new CustomException("Không tìm thấy Chi tiết Ngày có Id là:  " + dayDetailId));
    }

    // Lấy tất cả DayDetails theo TourId
    @Override
    public List<DayDetails> findDayDetailByTourId(Long tourId) throws CustomException {
        Tours tour = findById(tourId);
        return dayDetailRepository.findByTour(tour);
    }

//    Xóa Tour theo Id
    @Override
    public void deleteById(Long tourId) throws CustomException {
        Tours tour = findById(tourId);

        // Nếu có DayDetails, không cho phép xóa
        if (tour.getDayDetails() != null && !tour.getDayDetails().isEmpty()) {
            throw new CustomException("Không thể xóa Ngày này (ID: " + tourId + ") vì nó có chứa " +
                    tour.getDayDetails().size() + " chi tiết ngày liên quan. Vui lòng xóa chi tiết ngày trước.");
        }

        // Nếu danh sách chi tiết ngày rỗng, tiến hành xóa
        tourRepository.delete(tour);
    }

//    Xóa DayDetail theo TourId và DayDetailId
    @Override
    public void deleteDayDetailById(Long tourId, Long dayDetailId) throws CustomException {
        DayDetails dayDetail = findDayDetailById(tourId, dayDetailId);
        dayDetailRepository.delete(dayDetail);
    }

    // Hàm định dạng ngày tháng theo yêu cầu
    private String formatDate(Date date) {
        if (date == null) {
            return "N/A";
        }
        // Sử dụng Locale Tiếng Việt để hiển thị tên thứ (EEEE) bằng tiếng Việt
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss EEEE", new Locale("vi", "VN"));
        return formatter.format(date);
    }

    // Hàm kiểm tra hai Date có cùng ngày hay không
    private boolean isSameDay(Date date1, Date date2) {
        if (date1 == null || date2 == null) return false;

        Calendar cal1 = Calendar.getInstance();
        cal1.setTime(date1);
        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(date2);

        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR)
                && cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH)
                && cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }

// Phương thức tiện ích để chuyển đổi URL thành Entity Images
    private Set<Images> mapImages(Set<String> imageUrls) {
        if (imageUrls == null) {
            return new HashSet<>();
        }
        return imageUrls.stream()
                .map(url -> Images.builder().url(url).build())
                .collect(Collectors.toSet());
    }
    // Chuyển từ DTO sang Entity
    public Tours requestToEntity(TourRequestDTO tourRequestDTO) {
        // Chuyển đổi Set<String> URLs thành Set<Images> Entities
        Set<Images> tourImages = mapImages(tourRequestDTO.getImages());

        // Build và trả về Tours Entity
        return Tours.builder()
                .tourName(tourRequestDTO.getTourName())
                .description(tourRequestDTO.getDescription())
                .areaId(tourRequestDTO.getAreaId())
                .images(tourImages)
                .dayDetails(tourRequestDTO.getDayDetails())
                .build();
    }

//    Chuyển từ Entity sang ResponseDTO
    public TourResponseDTO mapEntityToResponseDTO(Tours tour) throws CustomException {
        // Lấy chi tiết Area từ Microservice khác
        AreaResponseDTO areaDetails = areaServiceCommunication.getAreaById(tour.getAreaId());

        // Chuyển đổi và trả về
        return TourResponseDTO.builder()
                .id(tour.getId())
                .tourName(tour.getTourName())
                .description(tour.getDescription())
                .images(tour.getImages())
                .dayDetails(tour.getDayDetails())
                .area(areaDetails)
                .build();
    }
}

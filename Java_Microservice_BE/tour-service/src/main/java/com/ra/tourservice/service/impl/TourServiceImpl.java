package com.ra.tourservice.service.impl;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.req.TourRequestDTO;
import com.ra.tourservice.model.dto.req.UpdateTourRequestDTO;
import com.ra.tourservice.model.dto.resp.*;
import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Images;
import com.ra.tourservice.model.entity.Tours;
import com.ra.tourservice.repository.IDayDetailRepository;
import com.ra.tourservice.repository.IImageRepository;
import com.ra.tourservice.repository.ITourRepository;
import com.ra.tourservice.service.IAreaServiceCommunication;
import com.ra.tourservice.service.ITourService;
import com.ra.tourservice.service.ITourToBookingServiceCommunication;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
//    Gọi qua service Booking
    private final ITourToBookingServiceCommunication tourToBookingServiceCommunication;

    @Override
    public List<TourBookingResponseDTO> findAll() {
//       Lấy tất cả Tours
        List<Tours> tours = tourRepository.findAll();
        List<TourBookingResponseDTO> responseDTO = new ArrayList<>();
        for(Tours tour: tours){
            try {
                // Ánh xạ từng Tours sang TourResponseDTO
                TourBookingResponseDTO tourResponseDTO = mapEntityToTourBookingResponseDTO(tour);
                responseDTO.add(tourResponseDTO);
            } catch (CustomException e) {
                // Xử lý lỗi nếu cần, ví dụ: ghi log hoặc bỏ qua tour này
                throw new RuntimeException("Lỗi khi ánh xạ Tour ID: " + tour.getId() + " - " + e.getMessage());
            }
        }
        return responseDTO;
    }

    @Override
    public Page<TourBookingResponseDTO> findAllWithFilters(
            String search,
            Long areaId,
            Pageable pageable) {

//        Lấy trang Tours với bộ lọc
        Page<Tours> toursPage = tourRepository.findAllWithFilters(
                search,
                areaId,
                pageable
        );

        return toursPage.map(tour -> {
            try {
                // Sử dụng phương thức ánh xạ đã có để chuyển đổi
                return mapEntityToTourBookingResponseDTO(tour);
            } catch (CustomException e) {
                throw new RuntimeException("Lỗi khi ánh xạ hoặc giao tiếp Microservice cho Tour ID: " + tour.getId(), e);
            }
        });
    }

    @Override
    public List<Images> findAllImageUrlsByTourId(Long tourId) throws CustomException {
        Tours tour = findById(tourId);
        return new ArrayList<>(tour.getImages());
    }

    @Override
    public Page<Images> findAllImageUrlsByTourIdWithPage(Long tourId, Pageable pageable) throws CustomException {

        if (!tourRepository.existsById(tourId)) {
            throw new CustomException("Không tìm thấy Tour với ID: " + tourId + ".");
        }
        return tourRepository.findImagesByTourId(tourId, pageable);
    }

    // Lấy tất cả DayDetails theo TourId
    @Override
    public List<DayDetailBookingResponseDTO> findAllDayDetailByTourId(Long tourId) throws CustomException {

        Tours tour = findById(tourId);
        List<DayDetails> dayDetails = dayDetailRepository.findByTour(tour);

        AreaResponseDTO areaDetails = areaServiceCommunication.getAreaById(tour.getAreaId());

        TourInfoBasicResponseDTO tourInfo = TourInfoBasicResponseDTO.builder()
                .id(tour.getId())
                .tourName(tour.getTourName())
                .description(tour.getDescription())
                .area(areaDetails)
                .build();

        List<DayDetailBookingResponseDTO> responseDTOs = new ArrayList<>();

        for (DayDetails detail : dayDetails) {
            Boolean isBooked = tourToBookingServiceCommunication.checkIfTourIsUsedInBooking(tour.getId());
            DayDetailBookingResponseDTO dto = mapToDayDetailBookingResponseDTO(
                    detail,
                    tourInfo,
                    isBooked
            );

            responseDTOs.add(dto);
        }

        return responseDTOs;
    }

    @Override
    public Page<DayDetailBookingResponseDTO> findAllDayDetailByTourIdWithFilterPage(
            Long tourId,
            String search,
            Boolean status,
            Date departureDateFrom,
            Date departureDateTo,
            Date returnDateFrom,
            Date returnDateTo,
            Pageable pageable) throws CustomException {

        Tours tour = findById(tourId);

        Page<DayDetails> dayDetailPage = dayDetailRepository.findAllByTourIdAndDateFilters(
                tourId,
                search,
                status,
                departureDateFrom,
                departureDateTo,
                returnDateFrom,
                returnDateTo,
                pageable
        );

        AreaResponseDTO areaDetails = areaServiceCommunication.getAreaById(tour.getAreaId());

        TourInfoBasicResponseDTO tourInfo = TourInfoBasicResponseDTO.builder()
                .id(tour.getId())
                .tourName(tour.getTourName())
                .description(tour.getDescription())
                .area(areaDetails)
                .build();

        //  Ánh xạ Page<DayDetails> sang Page<DayDetailBookingResponseDTO>
        List<DayDetailBookingResponseDTO> dtoList = dayDetailPage.getContent().stream()
                .map(detail -> {
                    try {
                        // 3a. Lấy trạng thái Booking (Gọi Booking Service N lần)
                        Boolean isBooked = tourToBookingServiceCommunication.checkIfDayDetailInTourIsUsed(detail.getId());

                        // 3b. Sử dụng hàm map đã tối ưu
                        return mapToDayDetailBookingResponseDTO(detail, tourInfo, isBooked);
                    } catch (CustomException e) {
                        // Xử lý ngoại lệ trong quá trình map/gọi Microservice
                        throw new RuntimeException("Lỗi khi ánh xạ DayDetail ID: " + detail.getId(), e);
                    }
                })
                .collect(Collectors.toList());

        // Trả về Page mới (giữ nguyên thông tin phân trang)
        return new PageImpl<>(dtoList, pageable, dayDetailPage.getTotalElements());
    }

    @Override
    public TourResponseDTO save(TourRequestDTO tourRequestDTO) throws CustomException {
        try {
            if(tourRequestDTO.getTourName() == null || tourRequestDTO.getTourName().isEmpty()){
                throw new CustomException("Tên Tour không được để trống!");
            }

            if (tourRequestDTO.getDescription() == null || tourRequestDTO.getDescription().isEmpty()) {
                throw new CustomException("Mô tả Tour không được để trống!");
            }

            Set<String> imageUrls = tourRequestDTO.getImages();
            if (imageUrls == null || imageUrls.isEmpty()) {
                throw new CustomException("Danh sách hình ảnh không được để trống.");
            }
            if (imageUrls.stream().anyMatch(url -> url == null || url.trim().isEmpty())) {
                throw new CustomException("URL hình ảnh không được rỗng.");
            }

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

                if(current.getPrice() == null || current.getPrice() <= 0){
                    throw new CustomException("Giá trong chi tiết ngày không được để trống hoặc nhỏ hơn bằng 0");
                }

                if(current.getSlot() == null || current.getSlot() < 50 || current.getSlot() > 200){
                    throw new CustomException("Số chỗ trong chi tiết ngày không được để trống hoặc nhỏ hơn 50 hoặc lớn hơn 200");
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

    @Override
    public DayDetailResponseDTO  findDayDetailById(Long dayDetailId) throws CustomException {
        DayDetails dayDetail = dayDetailRepository.findById(dayDetailId)
                .orElseThrow(() -> new CustomException("Không tìm thấy Chi tiết Ngày có Id là: " + dayDetailId));

        return mapToDayDetailResponseDTO(dayDetail);
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

                    if(detail.getPrice() == null || detail.getPrice() <= 0){
                        throw new CustomException("Giá trong chi tiết ngày không được để trống hoặc nhỏ hơn bằng 0");
                    }

                    if(detail.getSlot() == null || detail.getSlot() < 50 || detail.getSlot() > 200){
                        throw new CustomException("Số chỗ trong chi tiết ngày không được để trống hoặc nhỏ hơn 50 hoặc lớn hơn 200");
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
    public TourResponseDTO updateTour(UpdateTourRequestDTO updateTourRequestDTO, Long tourId) throws CustomException {
        Tours existingTour = findById(tourId);

        // Cập nhật các trường khác null và thực sự khác biệt
        if (updateTourRequestDTO.getTourName() != null &&
                !updateTourRequestDTO.getTourName().equals(existingTour.getTourName())) {

            existingTour.setTourName(updateTourRequestDTO.getTourName());
        }

        if (updateTourRequestDTO.getDescription() != null &&
                !updateTourRequestDTO.getDescription().equals(existingTour.getDescription())) {

            existingTour.setDescription(updateTourRequestDTO.getDescription());
        }

        if (updateTourRequestDTO.getAreaId() != null &&
                !updateTourRequestDTO.getAreaId().equals(existingTour.getAreaId())) {

            Long areaId = updateTourRequestDTO.getAreaId();
            AreaResponseDTO area = areaServiceCommunication.getAreaById(areaId);
            if (area == null || !area.getStatus()) {
                throw new CustomException("Area (ID: " + areaId + ") không tồn tại hoặc không hoạt động.");
            }
            existingTour.setAreaId(areaId);
        }

        // Lưu Tour đã cập nhật
        Tours updatedTour = tourRepository.save(existingTour);

        // Trả về TourResponseDTO
        return mapEntityToResponseDTO(updatedTour);
    }


    @Override
    public Tours updateDayDetail(UpdateTourRequestDTO updateTourRequestDTO, Long tourId, Long dayDetailId)
            throws CustomException
    {
        Boolean isDayDetailUsed = tourToBookingServiceCommunication.checkIfDayDetailInTourIsUsed(dayDetailId);
        if(isDayDetailUsed){
            throw new CustomException("Không thể cập nhật Chi tiết Ngày (ID: " + dayDetailId + ") vì nó đã được khách hàng đặt.");
        }

        // Tìm DayDetail hiện tại
        DayDetails existingDetail = findDayDetailById(tourId, dayDetailId);
        // Lấy DayDetail từ DTO
        DayDetails incomingDetail = updateTourRequestDTO.getDayDetail();
        // Tải tất cả chi tiết ngày của Day cha (bao gồm cả existingDetail)
        List<DayDetailBookingResponseDTO> siblingDetails = findAllDayDetailByTourId(tourId);

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
        for (DayDetailBookingResponseDTO sibling : siblingDetails) {
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
                if(incomingDetail.getPrice() <= 0){
                    throw new CustomException("Giá trong chi tiết ngày không được để trống hoặc nhỏ hơn bằng 0");
                }
                existingDetail.setPrice(incomingDetail.getPrice());
            }

            // Cập nhật Số chỗ (Slot)
            if (incomingDetail.getSlot() != null &&
                    !incomingDetail.getSlot().equals(existingDetail.getSlot())) {
                if(incomingDetail.getSlot() <=0 || incomingDetail.getSlot() > 200){
                    throw new CustomException("Số chỗ trong chi tiết ngày không được để trống hoặc nhỏ hơn 0 hoặc lớn hơn 200");
                }
                existingDetail.setSlot(incomingDetail.getSlot());
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

        Images imageToUpdate = existingImages.stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new CustomException("Không tìm thấy hình ảnh có Id là: " + imageId));

        // Lấy URL mới từ DTO
        String newUrl = updateTourRequestDTO.getImage();

        // Kiểm tra nếu URL mới khác với URL hiện tại
        if (newUrl != null && !newUrl.equals(imageToUpdate.getUrl())) {

            //  Đảm bảo URL mới không trùng với URL của bất kỳ hình ảnh nào KHÁC trong Tour.
            boolean isDuplicate = existingImages.stream()
                    // Lọc BỎ hình ảnh đang được cập nhật (imageId)
                    .filter(img -> !img.getId().equals(imageId))
                    // Kiểm tra xem có URL trùng lặp nào không
                    .anyMatch(img -> img.getUrl().equals(newUrl));

            if (isDuplicate) {
                // Nếu trùng lặp với hình ảnh KHÁC, ném ngoại lệ
                throw new CustomException("URL hình ảnh mới đã tồn tại (trùng với một hình ảnh khác) trong Tour này.");
            }

            //Cập nhật URL
            imageToUpdate.setUrl(newUrl);
        }

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



//    Xóa Tour theo Id
    @Override
    public void deleteById(Long tourId) throws CustomException {
        Tours tour = findById(tourId);

        // Nếu có DayDetails, không cho phép xóa
        if (tour.getDayDetails() != null && !tour.getDayDetails().isEmpty()) {
//            Xóa từng cái một DayDetails liên quan trước khi xóa Tour
            throw new CustomException("Không thể xóa Ngày này (ID: " + tourId + ") vì nó có chứa " +
                    tour.getDayDetails().size() + " chi tiết ngày liên quan. Vui lòng xóa chi tiết ngày trước.");
//            dayDetailRepository.deleteAll(tour.getDayDetails()); // Xóa tất cả DayDetails liên quan trước khi xóa Tour
        }

        if(tour.getImages() != null && !tour.getImages().isEmpty()){
            // Xóa tất cả Images liên quan trước khi xóa Tour
            imageRepository.deleteAll(tour.getImages());
        }

        // Nếu danh sách chi tiết ngày rỗng, tiến hành xóa
        tourRepository.delete(tour);
    }

//    Xóa DayDetail theo TourId và DayDetailId
    @Override
    public void deleteDayDetailById(Long tourId, Long dayDetailId) throws CustomException {
        Boolean isDayDetailUsed = tourToBookingServiceCommunication.checkIfDayDetailInTourIsUsed(dayDetailId);
        if(isDayDetailUsed){
            throw new CustomException("Không thể xóa Chi tiết Ngày (ID: " + dayDetailId + ") vì nó đã được khách hàng đặt.");
        }

        DayDetails dayDetail = findDayDetailById(tourId, dayDetailId);
       if(dayDetail!= null){
           if(dayDetail.getStatus()){
               dayDetail.setStatus(false);
               dayDetailRepository.save(dayDetail);
               throw new CustomException("Chi tiết ngày (ID: " + dayDetailId + ") vẫn đang hoạt động. Trạng thái đã được chuyển sang không hoạt động.");
           }else {
               dayDetailRepository.delete(dayDetail);
           }
       } else {
           throw new CustomException("Không tìm thấy Chi tiết Ngày có Id là: " + dayDetailId);
       }
    }

//    Xóa Image theo TourId và ImageId
    @Override
    public void deleteImageById(Long tourId, Long imageId) throws CustomException {
        Tours tour = findById(tourId);
        Set<Images> existingImages = tour.getImages(); // Lấy tập hợp Images hiện tại

        // Tìm hình ảnh cần xóa
        Images imageToDelete = existingImages.stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new CustomException("Không tìm thấy hình ảnh có Id là: " + imageId));

        // Xóa hình ảnh khỏi tập hợp của Tour
        existingImages.remove(imageToDelete);

        // Xóa hình ảnh khỏi cơ sở dữ liệu
        imageRepository.delete(imageToDelete);

        // Lưu Tour sau khi xóa hình ảnh
        tourRepository.save(tour);
    }

//    Mở khóa Chi tiết Ngày
    @Override
    public void openBlockDayDetail(Long tourId, Long dayDetailId) throws CustomException {
        DayDetails dayDetail = findDayDetailById(tourId, dayDetailId);
        if(dayDetail == null){
            throw new CustomException("Chi tiết Ngày không tồn tại");
        }
        if(dayDetail.getStatus()){
            throw new CustomException("Chi tiết Ngày vẫn đang hoạt động");
        }else {
            dayDetail.setStatus(true);
        }
        dayDetailRepository.save(dayDetail);
    }

//    Đặt chỗ - trừ chỗ trống (slots) trong DayDetail
    @Override
    public void deductSlots(Long dayDetailId, Long slots) throws CustomException {
        DayDetails dayDetail = dayDetailRepository.findById(dayDetailId)
                .orElseThrow(() -> new CustomException("Không tìm thấy Chi tiết Ngày có Id là: " + dayDetailId));
        if (dayDetail.getSlot() < slots) {
            throw new CustomException("Không đủ chỗ trống để đặt. Chỗ trống hiện tại: " + dayDetail.getSlot());
        }
        if(slots <= 0){
            throw new CustomException("Phải đặt ít nhất 1 chỗ.");
        }
        dayDetail.setSlot(dayDetail.getSlot() - slots);
        dayDetailRepository.save(dayDetail);
    }



    // Hàm định dạng ngày tháng theo yêu cầu
    private String formatDate(Date date) {
        if (date == null) {
            return "N/A";
        }
        // Sử dụng Locale Tiếng Việt để hiển thị tên thứ (EEEE) bằng tiếng Việt
        SimpleDateFormat formatter = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss", new Locale("vi", "VN"));
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

//    Chuyển từ Entity sang DayDetailResponseDTO
    private DayDetailResponseDTO mapToDayDetailResponseDTO(DayDetails dayDetail) throws CustomException {
        Tours tour = dayDetail.getTour();
        // Lấy chi tiết Area từ Microservice khác
        AreaResponseDTO areaDetails = areaServiceCommunication.getAreaById(tour.getAreaId());

        TourInfoBasicResponseDTO tourInfo = TourInfoBasicResponseDTO.builder()
                .id(tour.getId())
                .tourName(tour.getTourName())
                .description(tour.getDescription())
                .area(areaDetails)
                .build();

        return DayDetailResponseDTO.builder()
                .id(dayDetail.getId())
                .departureDate(dayDetail.getDepartureDate())
                .returnDate(dayDetail.getReturnDate())
                .slot(dayDetail.getSlot())
                .price(dayDetail.getPrice())
                .status(dayDetail.getStatus())
                .tour(tourInfo)
                .build();
    }

//    Chuyển từ Entity sang DayDetailBookingResponseDTO
    private DayDetailBookingResponseDTO mapToDayDetailBookingResponseDTO(
            DayDetails dayDetail,
            TourInfoBasicResponseDTO tourInfo,
            Boolean isBooked) throws CustomException {

        return DayDetailBookingResponseDTO.builder()
                .id(dayDetail.getId())
                .departureDate(dayDetail.getDepartureDate())
                .returnDate(dayDetail.getReturnDate())
                .slot(dayDetail.getSlot())
                .isBooked(isBooked)
                .price(dayDetail.getPrice())
                .status(dayDetail.getStatus())
                .tour(tourInfo)
                .build();
    }

    // Chuyển từ DTO sang Entity Tours
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

    public TourBookingResponseDTO mapEntityToTourBookingResponseDTO(Tours tour) throws CustomException {
        // Lấy chi tiết Area từ Microservice khác
        AreaResponseDTO areaDetails = areaServiceCommunication.getAreaById(tour.getAreaId());
        Boolean isUsed = tourToBookingServiceCommunication.checkIfTourIsUsedInBooking(tour.getId());
        // Chuyển đổi và trả về
        return TourBookingResponseDTO.builder()
                .id(tour.getId())
                .tourName(tour.getTourName())
                .description(tour.getDescription())
                .isBooking(isUsed)
                .images(tour.getImages())
                .dayDetails(tour.getDayDetails())
                .area(areaDetails)
                .build();
    }
}

package com.ra.tourservice.controller.admin;

import com.ra.tourservice.exception.CustomException;
import com.ra.tourservice.model.dto.req.TourRequestDTO;
import com.ra.tourservice.model.dto.req.UpdateTourRequestDTO;
import com.ra.tourservice.model.dto.resp.TourResponseDTO;
import com.ra.tourservice.model.entity.Tours;
import com.ra.tourservice.security.annotation.RequireRole;
import com.ra.tourservice.service.ITourService;
import com.ra.tourservice.service.ITourToAreaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tours")
@RequiredArgsConstructor
public class ATourController {
    private final ITourService tourService;
    private final ITourToAreaService tourToAreaService;

    @GetMapping("/test")
    public String test(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        String roles = request.getHeader("X-User-Role");

        return "Request từ user: " + email + " | Roles: " + roles;
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/findAll")
    public ResponseEntity<List<TourResponseDTO>> getAllTours() {
        List<TourResponseDTO> tours = tourService.findAll();
        return ResponseEntity.ok(tours);
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PostMapping
    public  ResponseEntity<?> addNewTour(@Valid @RequestBody TourRequestDTO tourRequestDTO){
        try {
            TourResponseDTO responseDTO = tourService.save(tourRequestDTO);
            return ResponseEntity.created(URI.create("/api/v1/admin/tours"))
                    .body(responseDTO);
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PostMapping("/{tourId}/dayDetails")
    public ResponseEntity<?> addNewDayDetailById(
            @Valid @RequestBody TourRequestDTO tourRequestDTO,
            @PathVariable Long tourId)
    {
        try {
            return ResponseEntity.ok().body(tourService.saveDayDetails(tourRequestDTO, tourId));
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PostMapping("/{tourId}/images")
    public ResponseEntity<?> addNewImagesById(
            @Valid @RequestBody TourRequestDTO tourRequestDTO,
            @PathVariable Long tourId)
    {
        try {
            return ResponseEntity.ok().body(tourService.saveImages(tourRequestDTO, tourId));
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PutMapping("/{tourId}" )
    public ResponseEntity<?> updateTourById(
            @Valid @RequestBody UpdateTourRequestDTO updateTourRequestDTO,
            @PathVariable Long tourId)
    {
        try {
            return ResponseEntity.ok().body(tourService.updateTour(updateTourRequestDTO, tourId));
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PutMapping("/{tourId}/details/{dayDetailId}" )
    public ResponseEntity<?> updateDayDetailByTourIdAndDetailId(
            @Valid @RequestBody UpdateTourRequestDTO updateTourRequestDTO,
            @PathVariable Long tourId,
            @PathVariable Long dayDetailId)
    {
        try {
            return ResponseEntity.ok().body(tourService.updateDayDetail(updateTourRequestDTO, tourId, dayDetailId));
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @PutMapping("/{tourId}/images/{imageId}" )
    public ResponseEntity<?> updateImagesByTourIdAndImageId(
            @Valid @RequestBody UpdateTourRequestDTO updateTourRequestDTO,
            @PathVariable Long tourId,
            @PathVariable Long imageId)
    {
        try {
            return ResponseEntity.ok().body(tourService.updateImages(updateTourRequestDTO, tourId, imageId));
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @DeleteMapping("/{dayId}")
    public ResponseEntity<?> deleteDayById(@PathVariable Long dayId){
        try {
            tourService.deleteById(dayId);
            return ResponseEntity.ok().body("Xoá ngày thành công.");
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @DeleteMapping("/{dayId}/details/{dayDetailId}")
    public ResponseEntity<?> deleteDayDetailById(
            @PathVariable Long dayId,
            @PathVariable Long dayDetailId)
    {
        try {
            tourService.deleteDayDetailById(dayId, dayDetailId);
            return ResponseEntity.ok().body("Xoá chi tiết ngày thành công.");
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @DeleteMapping("/{tourId}/images/{imageId}")
    public ResponseEntity<?> deleteImageById(
            @PathVariable Long tourId,
            @PathVariable Long imageId)
    {
        try {
            tourService.deleteImageById(tourId, imageId);
            return ResponseEntity.ok().body("Xoá hình ảnh thành công.");
        } catch (CustomException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

//    ===============================
//         Tour liên quan đến Area
//    ===============================

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/areas/{areaId}/check")
    public ResponseEntity<?> checkIfAreaIsUsed(@PathVariable Long areaId){
        Boolean isUsed = tourToAreaService.checkIfAreaIsUsed(areaId);
        return ResponseEntity.ok().body(isUsed);
    }

    @RequireRole({"ROLE_ADMIN", "ROLE_OWNER"})
    @GetMapping("/{areaId}/tours")
    public ResponseEntity<?> ExistsByAreaId(@PathVariable Long areaId) throws CustomException {
        try {
            Boolean isExists = tourToAreaService.existsByAreaId(areaId);
            return ResponseEntity.ok().body(isExists);
        }catch (CustomException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}

package com.ra.tourservice.model.dto.resp;

import com.ra.tourservice.model.entity.DayDetails;
import com.ra.tourservice.model.entity.Images;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourBookingResponseDTO {
    private Long id;
    private String tourName;
    private String description;
    private Boolean isBooking;
    private AreaResponseDTO area; // Chứa thông tin về khu vực
    private Set<Images> images;
    private List<DayDetails> dayDetails;
}

package com.ra.bookingservice.model.dto.resp.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class TourInfoBasicResponseDTO {
    private String tourName;
    private AreaResponseDTO area; // Chứa thông tin về khu vực
    private String description;
}

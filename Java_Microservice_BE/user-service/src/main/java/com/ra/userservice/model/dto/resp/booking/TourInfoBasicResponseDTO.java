package com.ra.userservice.model.dto.resp.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class TourInfoBasicResponseDTO {
    private Long id;
    private String tourName;
    private AreaResponseDTO area; // Chứa thông tin về khu vực
    private String description;
}

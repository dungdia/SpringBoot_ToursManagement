package com.ra.tourservice.model.dto.resp;

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

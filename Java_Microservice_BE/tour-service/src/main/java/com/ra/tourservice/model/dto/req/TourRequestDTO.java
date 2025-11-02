package com.ra.tourservice.model.dto.req;

import com.ra.tourservice.model.entity.DayDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class TourRequestDTO {
    private String tourName;
    private String description;
    private Long areaId;
    private Set<String> images;
    private List<DayDetails> dayDetails;
}

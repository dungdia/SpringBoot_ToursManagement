package com.ra.tourservice.model.dto.req;

import com.ra.tourservice.model.entity.DayDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UpdateTourRequestDTO {
    private String tourName;
    private String description;
    private String image;
    private DayDetails dayDetail;
}

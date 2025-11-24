package com.ra.userservice.model.dto.resp.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class AreaResponseDTO {
    private Long id;
    private String  areaName;
    private Boolean status;
}

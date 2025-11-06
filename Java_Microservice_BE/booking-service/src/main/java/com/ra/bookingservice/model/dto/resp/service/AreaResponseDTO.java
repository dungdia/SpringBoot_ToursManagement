package com.ra.bookingservice.model.dto.resp.service;

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

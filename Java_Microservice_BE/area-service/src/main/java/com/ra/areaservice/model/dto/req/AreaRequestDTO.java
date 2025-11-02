package com.ra.areaservice.model.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class AreaRequestDTO {
    @NotBlank(message = "Tên khu vực không được để trống")
    private String areaName;
    private Boolean status;
}

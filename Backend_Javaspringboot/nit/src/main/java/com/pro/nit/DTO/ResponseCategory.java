package com.pro.nit.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseCategory {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean status;
//    private String createdBy;
//    private String updatedBy;
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
}
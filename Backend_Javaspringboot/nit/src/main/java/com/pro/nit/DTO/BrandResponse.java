package com.pro.nit.DTO;


import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandResponse {
    private Long id;
    private String name;
//    private String code;
    private String description;
    private Boolean status;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}

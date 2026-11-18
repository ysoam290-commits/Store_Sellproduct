package com.pro.nit.DTO;


import lombok.*;
import org.springframework.stereotype.Service;

import java.util.SplittableRandom;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandRequest {
    private String name;
//    private String code;
    private String description;
    private Boolean status;
    private String createdAt;
    private String updatedBy;
}

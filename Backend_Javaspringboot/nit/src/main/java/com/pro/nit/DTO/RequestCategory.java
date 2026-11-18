package com.pro.nit.DTO;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RequestCategory {
    @NotEmpty(message = "Name required! ")
    private String name;
    @NotEmpty(message = "Code required! ")
    private String code;
    private String description;
    private Boolean status;
}

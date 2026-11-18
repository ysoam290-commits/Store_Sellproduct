package com.pro.nit.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotEmpty(message = "Name Required!")
    private String productName;

    @NotNull(message = "Quantity required!")
    @Min(value = 0, message = "Quantity must be >= 0")
    private Integer quantity;

    @NotNull(message = "Price required!")
    @Min(value = 0, message = "Price must be >= 0")
    private Double price;

    @NotNull(message = "Status required!")
    private Boolean status;

    private String description;

    @NotNull(message = "BrandId required!")
    private Long brandId;

    @NotNull(message = "CategoryId required!")
    private Long categoryId;
}
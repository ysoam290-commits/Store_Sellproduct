package com.pro.nit.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;

    private String productName;

    private Integer quantity;

    private Double price;

    private Boolean status;

    private String image;

    private String description;

    private Long brandId;

    private String brandName;

    private Long categoryId;

    private String categoryName;
}
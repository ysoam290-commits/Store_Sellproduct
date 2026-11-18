package com.pro.nit.Mapper;

import com.pro.nit.DTO.ProductRequest;
import com.pro.nit.DTO.ProductResponse;
import com.pro.nit.Entity.Brand;
import com.pro.nit.Entity.Category;
import com.pro.nit.Entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    // =========================
    // REQUEST → ENTITY
    // =========================
    public Product toEntity(
            ProductRequest dto,
            Category category,
            Brand brand
    ) {

        return Product.builder()

                .productName(dto.getProductName())

                .quantity(dto.getQuantity())

                .price(dto.getPrice())

                .status(dto.getStatus())

                .description(dto.getDescription())

                .category(category)

                .brand(brand)

                .build();
    }


    // =========================
    // ENTITY → RESPONSE
    // =========================
    public ProductResponse toResponse(Product obj) {

        return ProductResponse.builder()

                .id(obj.getId())

                .productName(obj.getProductName())

                .quantity(obj.getQuantity())

                .price(obj.getPrice())

                .status(obj.getStatus())

                .image(obj.getImage())

                .description(obj.getDescription())

                .brandId(
                        obj.getBrand().getId()
                )

                .brandName(
                        obj.getBrand().getName()
                )

                .categoryId(
                        obj.getCategory().getId()
                )

                .categoryName(
                        obj.getCategory().getName()
                )

                .build();
    }
}
package com.pro.nit.Mapper;

import com.pro.nit.DTO.BrandRequest;
import com.pro.nit.DTO.BrandResponse;
import com.pro.nit.Entity.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    // Entity -> Response DTO
    public BrandResponse toResponse(Brand brand) {
        if (brand == null) {
            return null;
        }

        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
//                .code(brand.getCode())
                .description(brand.getDescription())
                .status(brand.getStatus())
                .createdAt(brand.getCreatedAt())
                .createdBy(brand.getCreatedBy())
                .updatedAt(brand.getUpdatedAt())
                .updatedBy(brand.getUpdatedBy())
                .build();
    }

    // Request DTO -> Entity
    public Brand toEntity(BrandRequest request) {
        if (request == null) {
            return null;
        }

        return Brand.builder()
                .name(request.getName())
//                .code(request.getCode())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : true)
                .createdBy(request.getUpdatedBy() != null ? request.getUpdatedBy() : "system") // Fallback for createdBy
                .updatedBy(request.getUpdatedBy())
                .build();
    }

    // Update existing Entity from Request DTO
    public void updateEntityFromDto(BrandRequest request, Brand brand) {
        if (request == null || brand == null) {
            return;
        }

        if (request.getName() != null) brand.setName(request.getName());
//        if (request.getCode() != null) brand.setCode(request.getCode());
        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getStatus() != null) brand.setStatus(request.getStatus());
        if (request.getUpdatedBy() != null) brand.setUpdatedBy(request.getUpdatedBy());
    }
}
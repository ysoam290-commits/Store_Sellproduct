package com.pro.nit.Mapper;

import com.pro.nit.DTO.RequestCategory;
import com.pro.nit.DTO.ResponseCategory;
import com.pro.nit.Entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    // 1. បកប្រែពី RequestCategory (DTO) -> Category (Entity)
    public Category toEntity(RequestCategory dto) {
        return Category.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .status(dto.getStatus() != null ? dto.getStatus() : true)
                .description(dto.getDescription())
                .build();
    }

    public ResponseCategory toResponse(Category entity) {
        return ResponseCategory.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .status(entity.getStatus())
                .description(entity.getDescription())
//                .createdBy(entity.getCreatedBy())
//                .updatedBy(entity.getUpdatedBy())
//                .createdAt(entity.getCreatedAt())
//                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
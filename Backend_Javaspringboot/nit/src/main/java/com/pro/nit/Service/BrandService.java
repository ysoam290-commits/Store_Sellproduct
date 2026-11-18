package com.pro.nit.Service;

import com.pro.nit.DTO.BrandRequest;
import com.pro.nit.DTO.BrandResponse;
import com.pro.nit.Exception.ResourceNotFoundException;
import com.pro.nit.Mapper.BrandMapper;
import com.pro.nit.Entity.Brand;
import com.pro.nit.Repository.BrandRepository;
import com.pro.nit.Repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final BrandMapper mapper;

    public List<BrandResponse> getAll() {
        return brandRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    public BrandResponse getById(Long id) {
//        Brand brand = brandRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return mapper.toResponse(brand);
    }

    public BrandResponse create(BrandRequest request) {
        Brand brand = mapper.toEntity(request);
        Brand savedBrand = brandRepository.save(brand);
        return mapper.toResponse(savedBrand);
    }

    public BrandResponse update(Long id, BrandRequest request) {
        Brand existingBrand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

        mapper.updateEntityFromDto(request, existingBrand);
        Brand updatedBrand = brandRepository.save(existingBrand);
        return mapper.toResponse(updatedBrand);
    }

    public void delete(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new ResourceNotFoundException("Brand not found with id: " + id);
        }
        if (productRepository.countByBrand_Id(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete this brand while products are linked to it. Reassign or remove those products first.");
        }
        brandRepository.deleteById(id);
    }
}
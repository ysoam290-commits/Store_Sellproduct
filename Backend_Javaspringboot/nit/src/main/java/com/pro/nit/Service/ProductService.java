package com.pro.nit.Service;

import com.pro.nit.DTO.ProductRequest;
import com.pro.nit.DTO.ProductResponse;
import com.pro.nit.Entity.Brand;
import com.pro.nit.Entity.Category;
import com.pro.nit.Entity.Product;
import com.pro.nit.Exception.ResourceNotFoundException;
import com.pro.nit.Mapper.ProductMapper;
import com.pro.nit.Repository.BrandRepository;
import com.pro.nit.Repository.CategoryRepository;
import com.pro.nit.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductMapper productMapper;

    // File upload service
    private final FileStorageService fileStorageService;

    // CREATE PRODUCT

    public ProductResponse save(
            ProductRequest req,
            MultipartFile image
    ) {

        // 1. Validate request
        if (req == null) {
            throw new IllegalArgumentException(
                    "Product request is required!"
            );
        }

        if (req.getProductName() == null ||
                req.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Product name is required!"
            );
        }

        if (req.getDescription() != null &&
                req.getDescription().length() > 10000) {
            throw new IllegalArgumentException(
                    "Description cannot exceed 10000 characters!"
            );
        }

        if (req.getPrice() == null || req.getPrice() < 0) {
            throw new IllegalArgumentException(
                    "Invalid product price!"
            );
        }

        if (req.getQuantity() < 0) {
            throw new IllegalArgumentException(
                    "Quantity cannot be negative!"
            );
        }

        // 2. Find category
        Category category = categoryRepository
                .findById(req.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found!"
                        )
                );

        // 3. Find brand
        Brand brand = brandRepository
                .findById(req.getBrandId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Brand not found!"
                        )
                );

        // 4. Validate image
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException(
                    "Product image is required!"
            );
        }

        // 5. Convert request to entity
        Product product = productMapper.toEntity(
                req,
                category,
                brand
        );

        // 6. Save image
        String imageName = fileStorageService.saveImage(image);

        // 7. Save filename into database
        product.setImage(imageName);

        // 8. Save product
        Product savedProduct = productRepository.save(product);

        // 9. Return response
        return productMapper.toResponse(savedProduct);
    }



    // =========================
    // FIND ALL PRODUCTS
    // =========================
    public List<ProductResponse> findAll() {

        return productRepository.findAll(
                        Sort.by(
                                Sort.Order.desc("id")
                        )
                )
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // FILTER PRODUCTS
    // =========================
    public List<ProductResponse> filter(
            Long id,
            String productName,
            Boolean status,
            Long categoryId,
            Long brandId
    ) {

        Specification<Product> spec =
                Specification.unrestricted();


        // Filter by ID
        if (id != null) {

            spec = spec.and((root, query, cb) ->
                    cb.equal(
                            root.get("id"),
                            id
                    )
            );
        }


        // Filter by Product Name
        if (productName != null &&
                !productName.trim().isEmpty()) {

            String keyword =
                    productName.trim().toLowerCase();

            spec = spec.and((root, query, cb) ->
                    cb.like(
                            cb.lower(
                                    root.get("productName")
                            ),
                            "%" + keyword + "%"
                    )
            );
        }


        // Filter by Status
        if (status != null) {

            spec = spec.and((root, query, cb) ->
                    cb.equal(
                            root.get("status"),
                            status
                    )
            );
        }


        // Filter by Category
        if (categoryId != null) {

            spec = spec.and((root, query, cb) ->
                    cb.equal(
                            root.get("category").get("id"),
                            categoryId
                    )
            );
        }


        // Filter by Brand
        if (brandId != null) {

            spec = spec.and((root, query, cb) ->
                    cb.equal(
                            root.get("brand").get("id"),
                            brandId
                    )
            );
        }


        // Sort newest product first
        Sort sort =
                Sort.by(
                        Sort.Order.desc("id")
                );


        return productRepository
                .findAll(spec, sort)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }


    // =========================
    // FIND PRODUCT BY ID
    // =========================
    public ProductResponse findById(Long id) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found!"
                        )
                );

        return productMapper.toResponse(product);
    }


    // =========================
    // UPDATE PRODUCT
    // =========================
    public ProductResponse update(
            Long id,
            ProductRequest req
    ) {

        // 1. Find existing product
        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found!"
                        )
                );


        // 2. Find category
        Category category = categoryRepository
                .findById(req.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found!"
                        )
                );


        // 3. Find brand
        Brand brand = brandRepository
                .findById(req.getBrandId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Brand not found!"
                        )
                );


        // 4. Update product
        product.setProductName(
                req.getProductName()
        );

        product.setDescription(
                req.getDescription()
        );

        product.setPrice(
                req.getPrice()
        );

        product.setQuantity(
                req.getQuantity()
        );

        product.setStatus(
                req.getStatus()
        );

        // DO NOT use req.getImage()
        // Image upload is handled separately.

        product.setCategory(
                category
        );

        product.setBrand(
                brand
        );


        // 5. Save
        Product updatedProduct =
                productRepository.save(product);


        // 6. Return response
        return productMapper.toResponse(
                updatedProduct
        );
    }


    // =========================
    // DELETE PRODUCT
    // =========================
    public void delete(Long id) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found!"
                        )
                );

        productRepository.delete(product);
    }
}

package com.pro.nit.Controller;

import com.pro.nit.DTO.ProductRequest;
import com.pro.nit.DTO.ProductResponse;
import com.pro.nit.Service.ProductService;
import com.pro.nit.Util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // Get all products
    // Both USER and ADMIN can view all products
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> findAll() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.OK(productService.findAll()));
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> findById(
            @PathVariable Long id) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.OK(productService.findById(id)));
    }

    // Filter products
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> filter(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) Long categotyId,
            @RequestParam(required = false) Long brandId) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.OK(
                        productService.filter(
                                id,
                                productName,
                                status,
                                categotyId,
                                brandId
                        )
                ));
    }

    // Create product with image
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> save(
            @Valid @ModelAttribute ProductRequest req,
            @RequestPart("image") MultipartFile image) {

        ProductResponse product =
                productService.save(req, image);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.create(product));
    }

    // Update product
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest req) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.OK(
                        productService.update(id, req)
                ));
    }

    // Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> delete(
            @PathVariable Long id) {

        productService.delete(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.OK(
                        null,
                        "Delete successfully!"
                ));
    }
}

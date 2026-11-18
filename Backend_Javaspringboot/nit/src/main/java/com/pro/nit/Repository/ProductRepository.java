package com.pro.nit.Repository;

import com.pro.nit.DTO.PageResponse;
import com.pro.nit.DTO.ProductRequest;
import com.pro.nit.DTO.ProductResponse;
import com.pro.nit.Entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    long countByBrand_Id(Long brandId);
//    ProductResponse save(ProductRequest dto);

}

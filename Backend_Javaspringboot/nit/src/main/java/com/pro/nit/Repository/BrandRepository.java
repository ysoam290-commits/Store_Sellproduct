package com.pro.nit.Repository;

import com.pro.nit.Entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository <Brand, Long> {
    boolean existsByCode(String code);

}

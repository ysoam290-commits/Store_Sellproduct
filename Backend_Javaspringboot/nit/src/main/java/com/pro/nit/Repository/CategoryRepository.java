package com.pro.nit.Repository;

import com.pro.nit.Entity.Category; // Point to your Entity/Model
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>,
        JpaSpecificationExecutor<Category> {
    boolean existsByCode(String code);

}

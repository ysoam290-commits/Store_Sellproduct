
package com.pro.nit.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // PRODUCT NAME
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    // PRODUCT QUANTITY
    @Builder.Default
    @Column(nullable = false)
    private int quantity = 0;

    // PRODUCT PRICE
    @Builder.Default
    @Column(nullable = false)
    private Double price = 0.0;

    // PRODUCT STATUS
    @Builder.Default
    @Column(nullable = false)
    private Boolean status = true;

    // PRODUCT DESCRIPTION
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // PRODUCT IMAGE PATH (can be a long URL or data URI)
    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    // CREATED INFORMATION
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", updatable = false, length = 255)
    private String createdBy;

    // UPDATED INFORMATION
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 255)
    private String updatedBy;

    // CATEGORY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // BRAND
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    // CREATE
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.createdBy == null) {
            this.createdBy = "Admin";
        }

        if (this.status == null) {
            this.status = true;
        }
    }

    // UPDATE
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.updatedBy == null) {
            this.updatedBy = "Admin";
        }
    }
}

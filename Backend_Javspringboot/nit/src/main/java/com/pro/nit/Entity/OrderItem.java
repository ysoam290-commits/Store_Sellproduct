
package com.pro.nit.Entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    // =========================
    // ORDER ITEM ID
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // ORDER RELATIONSHIP
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // =========================
    // PRODUCT RELATIONSHIP
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // =========================
    // PRODUCT NAME
    // =========================
    @Column(name = "product_name",
            nullable = false)
    private String productName;

    // =========================
    // QUANTITY
    // =========================
    @Column(nullable = false)
    private Integer quantity;

    // =========================
    // UNIT PRICE
    // =========================
    @Column(name = "unit_price",
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal unitPrice;

    // =========================
    // SUBTOTAL
    // =========================
    @Column(nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal subtotal;

    // =========================
    // CALCULATE SUBTOTAL
    // =========================
    public void calculateSubtotal() {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        if (unitPrice == null ||
                unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Unit price cannot be negative"
            );
        }

        this.subtotal = unitPrice.multiply(
                BigDecimal.valueOf(quantity)
        );
    }

    // =========================
    // BEFORE SAVE
    // =========================
    @PrePersist
    @PreUpdate
    protected void onSave() {

        calculateSubtotal();

        // Save product name and price snapshot
        if (product != null) {
            this.productName = product.getProductName();

            if (product.getPrice() == null ||
                    product.getPrice() < 0) {
                throw new IllegalArgumentException(
                        "Invalid product price"
                );
            }

            this.unitPrice = BigDecimal.valueOf(
                    product.getPrice()
            );

            calculateSubtotal();
        }
    }
}

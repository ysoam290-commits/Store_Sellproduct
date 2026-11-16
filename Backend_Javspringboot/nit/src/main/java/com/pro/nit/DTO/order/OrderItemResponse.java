
package com.pro.nit.DTO.order;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    // =========================
    // ORDER ITEM ID
    // =========================
    private Long id;

    // =========================
    // PRODUCT INFORMATION
    // =========================
    private Long productId;

    private String productName;

    private String productImage;

    // =========================
    // QUANTITY
    // =========================
    private Integer quantity;

    // =========================
    // UNIT PRICE
    // =========================
    private BigDecimal unitPrice;

    // =========================
    // SUBTOTAL
    // =========================
    private BigDecimal subtotal;

}

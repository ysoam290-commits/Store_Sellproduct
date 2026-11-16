
package com.pro.nit.DTO.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    // =========================
    // PRODUCT ID
    // =========================
    @NotNull(message = "Product ID is required")
    private Long productId;

    // =========================
    // QUANTITY
    // =========================
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

}

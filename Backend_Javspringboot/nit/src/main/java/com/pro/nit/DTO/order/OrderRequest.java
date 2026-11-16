
package com.pro.nit.DTO.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    // =========================
    // SHIPPING ADDRESS
    // =========================
    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address is too long")
    private String shippingAddress;

    // =========================
    // CUSTOMER NOTE
    // =========================
    @Size(max = 1000, message = "Note is too long")
    private String note;

    // =========================
    // ORDER ITEMS
    // =========================
    @NotEmpty(message = "Order must contain at least one product")
    @Valid
    private List<OrderItemRequest> items;

}

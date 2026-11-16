
package com.pro.nit.DTO.order;

import com.pro.nit.Entity.Order;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    // =========================
    // ORDER INFORMATION
    // =========================
    private Long id;

    private String orderNumber;

    // =========================
    // CUSTOMER INFORMATION
    // =========================
    private Long userId;

    private String customerEmail;

    // =========================
    // SHIPPING INFORMATION
    // =========================
    private String shippingAddress;

    private String note;

    // =========================
    // ORDER ITEMS
    // =========================
    private List<OrderItemResponse> items;

    // =========================
    // TOTAL AMOUNT
    // =========================
    private BigDecimal totalAmount;

    // =========================
    // ORDER STATUS
    // =========================
    private Order.OrderStatus orderStatus;

    // =========================
    // PAYMENT STATUS
    // =========================
    private Order.PaymentStatus paymentStatus;

    // =========================
    // DATE INFORMATION
    // =========================
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

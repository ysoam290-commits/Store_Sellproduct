
package com.pro.nit.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    // =========================
    // ORDER ID
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // ORDER NUMBER
    // =========================
    @Column(name = "order_number",
            nullable = false,
            unique = true)
    private String orderNumber;

    // =========================
    // CUSTOMER
    // =========================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // =========================
    // TOTAL AMOUNT
    // =========================
    @Column(name = "total_amount",
            nullable = false,
            precision = 12,
            scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // =========================
    // ORDER STATUS
    // =========================
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status",
            nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    // =========================
    // PAYMENT STATUS
    // =========================
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status",
            nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    // =========================
    // SHIPPING ADDRESS
    // =========================
    @Column(name = "shipping_address",
            columnDefinition = "TEXT")
    private String shippingAddress;

    // =========================
    // ORDER NOTE
    // =========================
    @Column(columnDefinition = "TEXT")
    private String note;

    // =========================
    // ORDER ITEMS
    // =========================
    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItem> orderItems = new ArrayList<>();

    // =========================
    // CREATED AT
    // =========================
    @Column(name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    // =========================
    // UPDATED AT
    // =========================
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================
    // BEFORE INSERT
    // =========================
    @PrePersist
    protected void onCreate() {

        this.createdAt = LocalDateTime.now();

        if (this.orderNumber == null) {
            this.orderNumber =
                    "NIT-" + UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();
        }

        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }

        if (this.orderStatus == null) {
            this.orderStatus = OrderStatus.PENDING;
        }

        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.UNPAID;
        }
    }

    // =========================
    // BEFORE UPDATE
    // =========================
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // =========================
    // ORDER STATUS ENUM
    // =========================
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        COMPLETED,
        CANCELLED
    }

    // =========================
    // PAYMENT STATUS ENUM
    // =========================
    public enum PaymentStatus {
        UNPAID,
        PENDING,
        PAID,
        FAILED,
        REFUNDED
    }
}

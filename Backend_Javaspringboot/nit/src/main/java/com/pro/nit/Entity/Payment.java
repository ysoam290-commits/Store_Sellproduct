
package com.pro.nit.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "payments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "transaction_id"),
                @UniqueConstraint(columnNames = "payment_number")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_number", nullable = false, unique = true)
    private String paymentNumber;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod = "ABA_KHQR";

    @Column(name = "checkout_url")
    private String checkoutUrl;

    @Column(name = "aba_reference")
    private String abaReference;

    @Column(name = "qr_string", columnDefinition = "TEXT")
    private String qrString;

    @Column(name = "qr_image", columnDefinition = "TEXT")
    private String qrImage;

    @Column(name = "aba_pay_deeplink", columnDefinition = "TEXT")
    private String abaPayDeeplink;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentStatus {
        PENDING,
        PAID,
        FAILED,
        CANCELLED,
        EXPIRED,
        REFUNDED
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
        this.paymentStatus = status;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
        this.status = paymentStatus;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = PaymentStatus.PENDING;
        }

        if (this.paymentStatus == null) {
            this.paymentStatus = this.status;
        }

        this.paymentStatus = this.status;

        if (this.currency == null || this.currency.isBlank()) {
            this.currency = "USD";
        }

        if (this.paymentMethod == null || this.paymentMethod.isBlank()) {
            this.paymentMethod = "ABA_KHQR";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.paymentStatus = this.status;
    }
}

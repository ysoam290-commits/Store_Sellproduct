
package com.pro.nit.DTO.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class PaymentResponse {

    private Long paymentId;
    private Long orderId;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentMethod;

    private String checkoutUrl;
    private String qrString;
    private String qrImage;
    private String abaPayDeeplink;

    private Map<String, String> checkoutFields;

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    private String appStore;
    private String playStore;

    public PaymentResponse() {
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long value) {
        paymentId = value;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long value) {
        orderId = value;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String value) {
        transactionId = value;
    }

    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal value) {
        amount = value;
    }
    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String value) {
        currency = value;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String value) {
        status = value;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String value) {
        paymentMethod = value;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String value) {
        checkoutUrl = value;
    }

    public String getQrString() {
        return qrString;
    }

    public void setQrString(String value) {
        qrString = value;
    }

    public String getQrImage() {
        return qrImage;
    }

    public void setQrImage(String value) {
        qrImage = value;
    }

    public String getAbaPayDeeplink() {
        return abaPayDeeplink;
    }

    public void setAbaPayDeeplink(String value) {
        abaPayDeeplink = value;
    }
    public String getAppStore() {
        return appStore;
    }

    public void setAppStore(String appStore) {
        this.appStore = appStore;
    }

    public String getPlayStore() {
        return playStore;
    }

    public void setPlayStore(String playStore) {
        this.playStore = playStore;
    }


    public Map<String, String> getCheckoutFields() {
        return checkoutFields;
    }

    public void setCheckoutFields(Map<String, String> value) {
        checkoutFields = value;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime value) {
        expiresAt = value;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime value) {
        createdAt = value;
    }
}

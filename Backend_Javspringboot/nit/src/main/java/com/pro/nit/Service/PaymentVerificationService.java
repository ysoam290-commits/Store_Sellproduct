package com.pro.nit.Service;

import com.pro.nit.Config.AbaPayWayConfig;
import com.pro.nit.Entity.Order;
import com.pro.nit.Entity.Payment;
import com.pro.nit.Repository.OrderRepository;
import com.pro.nit.Repository.PaymentRepository;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentVerificationService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestClient restClient;
    private final AbaPayWayConfig abaPayWayConfig;

    public PaymentVerificationService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            AbaPayWayConfig abaPayWayConfig
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.abaPayWayConfig = abaPayWayConfig;
        this.restClient = RestClient.create();
    }

    // =====================================================
    // 1. VERIFY ABA TRANSACTION
    // =====================================================

    @Transactional
    public Map<String, Object> verifyPayment(String transactionId) {

        if (transactionId == null || transactionId.isBlank()) {
            throw new IllegalArgumentException(
                    "Transaction ID is required"
            );
        }

        validateConfiguration();

        Payment payment = paymentRepository
                .findByTransactionId(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found")
                );

        // Prevent processing an already paid transaction
        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            return createResult(
                    "PAID",
                    "Payment already verified"
            );
        }

        String reqTime = LocalDateTime.now(ZoneOffset.UTC)
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        String hash = generateCheckHash(
                reqTime,
                transactionId
        );

        Map<String, String> request = new HashMap<>();

        request.put("req_time", reqTime);
        request.put(
                "merchant_id",
                abaPayWayConfig.getMerchantId()
        );
        request.put("tran_id", transactionId);
        request.put("hash", hash);

        Map<String, Object> response = restClient.post()
                .uri(abaPayWayConfig.getCheckTransactionUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<
                        Map<String, Object>>() {
                });

        if (response == null) {
            throw new RuntimeException(
                    "Empty response from ABA"
            );
        }

        Map<String, Object> status =
                getMap(response.get("status"));

        Map<String, Object> data =
                getMap(response.get("data"));

        if (status == null || data == null) {
            throw new RuntimeException(
                    "Invalid ABA verification response"
            );
        }

        // Check ABA API response code
        String responseCode = String.valueOf(
                status.get("code")
        );

        if (!"00".equals(responseCode)) {
            throw new RuntimeException(
                    "ABA verification failed: "
                            + status.get("message")
            );
        }

        // Check transaction ID returned by ABA
        String returnedTransactionId = String.valueOf(
                status.get("tran_id")
        );

        if (!transactionId.equals(returnedTransactionId)) {
            throw new RuntimeException(
                    "Transaction ID mismatch"
            );
        }

        String abaStatus = String.valueOf(
                data.get("payment_status")
        ).toUpperCase();

        // Only compare amount and currency for successful payment.
        if ("APPROVED".equals(abaStatus)) {

            verifyAmount(payment, data);
            verifyCurrency(data);
        }

        // =================================================
        // PROCESS PAYMENT RESULT
        // =================================================

        switch (abaStatus) {

            case "APPROVED":

                String paymentStatusCode = String.valueOf(
                        data.get("payment_status_code")
                );

                if (!"0".equals(paymentStatusCode)) {
                    throw new RuntimeException(
                            "ABA payment status code is not successful"
                    );
                }

                payment.setStatus(
                        Payment.PaymentStatus.PAID
                );

                payment.setPaidAt(
                        LocalDateTime.now()
                );

                Object apv = data.get("apv");

                if (apv != null) {
                    payment.setAbaReference(
                            String.valueOf(apv)
                    );
                }

                updateOrderPaymentStatus(
                        payment,
                        Order.PaymentStatus.PAID,
                        Order.OrderStatus.CONFIRMED
                );

                paymentRepository.save(payment);

                return createResult(
                        "PAID",
                        "Payment successfully verified"
                );

            case "DECLINED":

                payment.setStatus(
                        Payment.PaymentStatus.FAILED
                );

                updateOrderPaymentStatus(
                        payment,
                        Order.PaymentStatus.FAILED,
                        null
                );

                paymentRepository.save(payment);

                return createResult(
                        "FAILED",
                        "Payment was declined"
                );

            case "CANCELLED":

                payment.setStatus(
                        Payment.PaymentStatus.CANCELLED
                );

                updateOrderPaymentStatus(
                        payment,
                        Order.PaymentStatus.FAILED,
                        null
                );

                paymentRepository.save(payment);

                return createResult(
                        "CANCELLED",
                        "Payment was cancelled"
                );

            case "REFUNDED":

                payment.setStatus(
                        Payment.PaymentStatus.REFUNDED
                );

                updateOrderPaymentStatus(
                        payment,
                        Order.PaymentStatus.REFUNDED,
                        null
                );

                paymentRepository.save(payment);

                return createResult(
                        "REFUNDED",
                        "Payment was refunded"
                );

            case "PENDING":

                updateOrderPaymentStatus(
                        payment,
                        Order.PaymentStatus.PENDING,
                        null
                );

                paymentRepository.save(payment);

                return createResult(
                        "PENDING",
                        "Waiting for customer payment"
                );

            default:

                return createResult(
                        "UNKNOWN",
                        "Unknown ABA payment status: " + abaStatus
                );
        }
    }

    // =====================================================
    // 2. VALIDATE CONFIGURATION
    // =====================================================

    private void validateConfiguration() {

        if (abaPayWayConfig.getMerchantId() == null
                || abaPayWayConfig.getMerchantId().isBlank()) {

            throw new IllegalStateException(
                    "ABA Merchant ID is not configured"
            );
        }

        if (abaPayWayConfig.getApiKey() == null
                || abaPayWayConfig.getApiKey().isBlank()) {

            throw new IllegalStateException(
                    "ABA API Key is not configured"
            );
        }

        if (abaPayWayConfig.getCheckTransactionUrl() == null
                || abaPayWayConfig.getCheckTransactionUrl().isBlank()) {

            throw new IllegalStateException(
                    "ABA Check Transaction URL is not configured"
            );
        }
    }

    // =====================================================
    // 3. VERIFY PAYMENT AMOUNT
    // =====================================================

    private void verifyAmount(
            Payment payment,
            Map<String, Object> data
    ) {

        Object totalAmountValue = data.get("total_amount");

        if (totalAmountValue == null
                || payment.getAmount() == null) {

            throw new RuntimeException(
                    "Payment amount is missing"
            );
        }

        BigDecimal abaAmount = new BigDecimal(
                String.valueOf(totalAmountValue)
        );

        if (abaAmount.compareTo(payment.getAmount()) != 0) {
            throw new RuntimeException(
                    "Payment amount mismatch"
            );
        }
    }

    // =====================================================
    // 4. VERIFY PAYMENT CURRENCY
    // =====================================================

    private void verifyCurrency(
            Map<String, Object> data
    ) {

        String abaCurrency = String.valueOf(
                data.get("payment_currency")
        );

        String configuredCurrency =
                abaPayWayConfig.getCurrency();

        if (configuredCurrency == null
                || !configuredCurrency.equalsIgnoreCase(abaCurrency)) {

            throw new RuntimeException(
                    "Payment currency mismatch"
            );
        }
    }

    // =====================================================
    // 5. UPDATE ORDER PAYMENT STATUS
    // =====================================================

    private void updateOrderPaymentStatus(
            Payment payment,
            Order.PaymentStatus paymentStatus,
            Order.OrderStatus orderStatus
    ) {

        Order order = orderRepository
                .findById(payment.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found for this payment"
                        )
                );

        order.setPaymentStatus(paymentStatus);

        if (orderStatus != null) {
            order.setOrderStatus(orderStatus);
        }

        orderRepository.save(order);
    }

    // =====================================================
    // 6. GENERATE ABA CHECK HASH
    // =====================================================

    private String generateCheckHash(
            String reqTime,
            String transactionId
    ) {

        try {

            String merchantId =
                    abaPayWayConfig.getMerchantId();

            String apiKey =
                    abaPayWayConfig.getApiKey();

            String hashData =
                    reqTime + merchantId + transactionId;

            Mac mac = Mac.getInstance("HmacSHA512");

            SecretKeySpec secretKey = new SecretKeySpec(
                    apiKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );

            mac.init(secretKey);

            byte[] hashBytes = mac.doFinal(
                    hashData.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getEncoder()
                    .encodeToString(hashBytes);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to generate ABA check hash",
                    e
            );
        }
    }

    // =====================================================
    // 7. HELPER: CONVERT OBJECT TO MAP
    // =====================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(Object value) {

        if (value instanceof Map<?, ?>) {
            return (Map<String, Object>) value;
        }

        return null;
    }

    // =====================================================
    // 8. CREATE RESULT
    // =====================================================

    private Map<String, Object> createResult(
            String status,
            String message
    ) {

        Map<String, Object> result = new HashMap<>();

        result.put("status", status);
        result.put("message", message);

        return result;
    }
}
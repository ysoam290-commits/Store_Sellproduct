
package com.pro.nit.Service;

import com.pro.nit.Config.AbaPayWayConfig;
import com.pro.nit.DTO.payment.PaymentRequest;
import com.pro.nit.DTO.payment.PaymentResponse;
import com.pro.nit.Entity.Order;
import com.pro.nit.Entity.Payment;
import com.pro.nit.Entity.User;
import com.pro.nit.Entity.UserProfile;
import com.pro.nit.Repository.OrderRepository;
import com.pro.nit.Repository.PaymentRepository;
import com.pro.nit.Repository.UserProfileRepository;
import com.pro.nit.Repository.UserRepository;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AbaPayWayConfig config;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RestClient restClient;

    private static final DateTimeFormatter REQ_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            AbaPayWayConfig config,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.config = config;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.restClient = RestClient.create();
    }

    // =====================================================
    // 1. CREATE ABA PURCHASE PAYMENT
    // =====================================================

    @Transactional
    public PaymentResponse createPurchasePayment(PaymentRequest request) {

        validatePurchaseConfiguration();

        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Order ID is required");
        }

        // Find order from database
        Order order = orderRepository.findByIdForPaymentUpdate(request.getOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (order.getOrderStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Cannot pay a cancelled order"
            );
        }

        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            throw new IllegalStateException(
                    "This order has already been paid"
            );
        }

        // Always get amount from database
        BigDecimal amount = order.getTotalAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Invalid order amount");
        }

        amount = amount.setScale(2, RoundingMode.HALF_UP);

        // Get customer information
        User user = order.getUser();

        if (user == null) {
            throw new IllegalStateException("Order customer not found");
        }

        UserProfile profile = user.getProfile();

        if (profile == null) {
            throw new IllegalStateException("Customer profile not found");
        }

        String firstName = requireValue(
                profile.getFirstName(),
                "Customer first name is required"
        );

        String lastName = requireValue(
                profile.getLastName(),
                "Customer last name is required"
        );

        String email = requireValue(
                user.getEmail(),
                "Customer email is required"
        );

        String phone = requireValue(
                user.getPhone(),
                "Customer phone is required"
        );

        String merchantId = requireValue(
                config.getMerchantId(),
                "ABA Merchant ID is missing"
        );

        // ABA PHP sample uses time() - Unix timestamp in seconds
        String reqTime = String.valueOf(
                Instant.now().getEpochSecond()
        );

        String transactionId = generateTransactionId();

        // This exact amount string is used in both hash and form
        String formattedAmount = amount.toPlainString();

        String returnParams = requireValue(
                order.getOrderNumber(),
                "Order number is required"
        );

        /*
         * IMPORTANT:
         * Follow the exact hash order in the ABA PHP sample:
         *
         * req_time
         * merchant_id
         * tran_id
         * amount
         * firstname
         * lastname
         * email
         * phone
         * return_params
         */

        String hashData =
                reqTime
                        + merchantId
                        + transactionId
                        + formattedAmount
                        + firstName
                        + lastName
                        + email
                        + phone
                        + returnParams;

        String hash = generateHmac(hashData);

        // Save payment in database
        Payment payment = new Payment();

        payment.setPaymentNumber(generatePaymentNumber());
        payment.setOrderId(order.getId());
        payment.setTransactionId(transactionId);
        payment.setAmount(amount);
        payment.setCurrency(
                config.getCurrency().trim().toUpperCase()
        );
        payment.setPaymentMethod("ABA_PAYWAY");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCheckoutUrl(config.getPurchaseUrl());

        payment = paymentRepository.save(payment);

        // Update order payment status
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        orderRepository.save(order);

        /*
         * These are the fields required by the ABA PHP sample.
         * React will submit these fields to ABA using an HTML form.
         */
        Map<String, String> checkoutFields = new LinkedHashMap<>();

        checkoutFields.put("hash", hash);
        checkoutFields.put("tran_id", transactionId);
        checkoutFields.put("amount", formattedAmount);
        checkoutFields.put("firstname", firstName);
        checkoutFields.put("lastname", lastName);
        checkoutFields.put("phone", phone);
        checkoutFields.put("email", email);
        checkoutFields.put("return_params", returnParams);
        checkoutFields.put("merchant_id", merchantId);
        checkoutFields.put("req_time", reqTime);

        PaymentResponse response = mapToResponse(payment);

        response.setCheckoutUrl(config.getPurchaseUrl());
        response.setCheckoutFields(checkoutFields);

        return response;
    }

    // =====================================================
    // 2. VERIFY PAYMENT
    // =====================================================


    @Transactional
    public PaymentResponse verifyPayment(Long paymentId, String authenticatedUsername) {

        Payment paymentSnapshot = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Payment not found"));
        Order order = orderRepository.findByIdForPaymentUpdate(paymentSnapshot.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        Payment payment = paymentRepository.findByIdForPaymentUpdate(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        User authenticatedUser = authenticatedUsername != null && authenticatedUsername.contains("@")
                ? userRepository.findByEmailIgnoreCase(authenticatedUsername).orElse(null)
                : userRepository.findByPhone(authenticatedUsername).orElse(null);
        if (authenticatedUser == null || order.getUser() == null
                || !Objects.equals(authenticatedUser.getId(), order.getUser().getId())) {
            throw new AccessDeniedException("This payment does not belong to the authenticated customer.");
        }

        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            return mapToResponse(payment);
        }

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            return mapToResponse(payment);
        }

        // Ask ABA to check the transaction
        Map<String, Object> abaResponse =
                checkAbaTransaction(payment.getTransactionId());

        Map<String, Object> data =
                asMap(abaResponse.get("data"));

        if (data == null) {
            throw new IllegalStateException(
                    "ABA transaction response has no data"
            );
        }

        Map<String, Object> abaStatus = asMap(abaResponse.get("status"));
        if (abaStatus == null || !payment.getTransactionId().equals(stringValue(abaStatus.get("tran_id")))) {
            throw new IllegalStateException("ABA transaction ID did not match the payment.");
        }

        String paymentStatus = stringValue(data.get("payment_status")).toUpperCase();
        String paymentStatusCode = stringValue(data.get("payment_status_code"));

        if ("APPROVED".equals(paymentStatus) && "0".equals(paymentStatusCode)) {
            verifyPaidAmountAndCurrency(payment, data);
            markPaymentAsPaid(payment, data);
        } else if ("DECLINED".equals(paymentStatus) || "FAILED".equals(paymentStatus)) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            setOrderPaymentStatus(payment, Order.PaymentStatus.FAILED, null);
        } else if ("CANCELLED".equals(paymentStatus)) {
            payment.setStatus(Payment.PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
            setOrderPaymentStatus(payment, Order.PaymentStatus.FAILED, null);
        } else if ("EXPIRED".equals(paymentStatus)
                || (payment.getExpiresAt() != null && !payment.getExpiresAt().isAfter(LocalDateTime.now()))) {
            payment.setStatus(Payment.PaymentStatus.EXPIRED);
            paymentRepository.save(payment);
        }

        return mapToResponse(payment);
    }


    // =====================================================
    // 3. CHECK TRANSACTION API
    // =====================================================

    private Map<String, Object> checkAbaTransaction(
            String transactionId
    ) {

        if (isBlank(config.getCheckTransactionUrl())) {
            throw new IllegalStateException(
                    "ABA Check Transaction URL is missing"
            );
        }

        String reqTime = getRequestTime();

        String merchantId = requireValue(
                config.getMerchantId(),
                "ABA Merchant ID is missing"
        );

        /*
         * IMPORTANT:
         * This is the existing Check Transaction hash formula.
         * Confirm it with the ABA Check Transaction documentation.
         * It is NOT the Purchase API hash formula.
         */

        String hashData =
                reqTime
                        + merchantId
                        + transactionId;

        Map<String, Object> payload = new LinkedHashMap<>();

        payload.put("req_time", reqTime);
        payload.put("merchant_id", merchantId);
        payload.put("tran_id", transactionId);
        payload.put("hash", generateHmac(hashData));

        Map<String, Object> response = restClient.post()
                .uri(config.getCheckTransactionUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "Empty ABA transaction response"
            );
        }

        Map<String, Object> status =
                asMap(response.get("status"));

        if (status == null
                || !"00".equals(stringValue(status.get("code")))) {

            String message = status == null
                    ? "Unknown error"
                    : stringValue(status.get("message"));

            throw new IllegalStateException(
                    "ABA Check Transaction API failed: " + message
            );
        }

        return response;
    }

    // =====================================================
    // 4. MARK PAYMENT AS PAID
    // =====================================================

    private void markPaymentAsPaid(
            Payment payment,
            Map<String, Object> data
    ) {

        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());

        Object apv = data.get("apv");

        if (apv != null) {
            payment.setAbaReference(apv.toString());
        }

        paymentRepository.save(payment);

        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        order.setPaymentStatus(Order.PaymentStatus.PAID);
        if (order.getOrderStatus() == Order.OrderStatus.PENDING) {
            order.setOrderStatus(Order.OrderStatus.CONFIRMED);
        }
        orderRepository.save(order);
    }

    private void verifyPaidAmountAndCurrency(Payment payment, Map<String, Object> data) {
        String totalAmount = stringValue(data.get("total_amount"));
        if (isBlank(totalAmount) || payment.getAmount() == null
                || new BigDecimal(totalAmount).compareTo(payment.getAmount()) != 0) {
            throw new IllegalStateException("ABA payment amount does not match the order amount.");
        }

        String paidCurrency = stringValue(data.get("payment_currency"));
        if (isBlank(paidCurrency) || !payment.getCurrency().equalsIgnoreCase(paidCurrency)) {
            throw new IllegalStateException("ABA payment currency does not match the order currency.");
        }
    }

    private void setOrderPaymentStatus(Payment payment, Order.PaymentStatus status, Order.OrderStatus orderStatus) {
        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setPaymentStatus(status);
        if (orderStatus != null) order.setOrderStatus(orderStatus);
        orderRepository.save(order);
    }

    // =====================================================
    // 5. ABA CALLBACK
    // =====================================================



    @Transactional
    public PaymentResponse createQrPayment(PaymentRequest request, String authenticatedUsername) {

        // 1. Validate request and configuration
        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException("Order ID is required");
        }

        String merchantId = requireValue(
                config.getMerchantId(),
                "ABA Merchant ID is missing"
        );

        if (isBlank(config.getApiKey())) {
            throw new IllegalStateException("ABA API Key is missing");
        }

        String qrUrl = requireValue(
                config.getQrUrl(),
                "ABA QR URL is missing"
        );

        String currency = requireValue(
                config.getCurrency(),
                "ABA Currency is missing"
        ).toUpperCase();

        if (!currency.equals("USD") && !currency.equals("KHR")) {
            throw new IllegalArgumentException("Currency must be USD or KHR");
        }

        // 2. Find and lock the order so concurrent retries reuse one pending QR.
        Order order = orderRepository.findByIdForPaymentUpdate(request.getOrderId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (order.getOrderStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot pay a cancelled order");
        }

        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            throw new IllegalStateException("Order has already been paid");
        }

        BigDecimal amount = order.getTotalAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Invalid order amount");
        }

        amount = amount.setScale(2, RoundingMode.HALF_UP);

        if (currency.equals("USD")
                && amount.compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("Minimum USD amount is 0.01");
        }

        if (currency.equals("KHR")
                && amount.compareTo(new BigDecimal("100")) < 0) {
            throw new IllegalArgumentException("Minimum KHR amount is 100");
        }

        // 3. Customer information
        User orderUser = order.getUser();
        User authenticatedUser = authenticatedUsername != null && authenticatedUsername.contains("@")
                ? userRepository.findByEmailIgnoreCase(authenticatedUsername).orElse(null)
                : userRepository.findByPhone(authenticatedUsername).orElse(null);
        if (orderUser == null || authenticatedUser == null
                || !Objects.equals(orderUser.getId(), authenticatedUser.getId())) {
            throw new AccessDeniedException("This order does not belong to the authenticated customer.");
        }
        User user = authenticatedUser;

        Payment latestPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(order.getId())
                .orElse(null);
        if (latestPayment != null && latestPayment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new IllegalStateException("Order has already been paid");
        }
        if (latestPayment != null && latestPayment.getStatus() == Payment.PaymentStatus.PENDING
                && (latestPayment.getExpiresAt() == null || latestPayment.getExpiresAt().isAfter(LocalDateTime.now()))) {
            return mapToResponse(latestPayment);
        }
        if (latestPayment != null && latestPayment.getStatus() == Payment.PaymentStatus.PENDING) {
            latestPayment.setStatus(Payment.PaymentStatus.EXPIRED);
            paymentRepository.save(latestPayment);
        }

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            String firstName = request.getFirstName() == null ? "" : request.getFirstName().trim();
            String lastName = request.getLastName() == null ? "" : request.getLastName().trim();
            if (firstName.isBlank() || lastName.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Customer profile is missing. First name and last name are required to create it."
                );
            }
            if (firstName.length() > 20 || lastName.length() > 20) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "First name and last name must each be 20 characters or fewer."
                );
            }

            profile = new UserProfile();
            profile.setUser(user);
            profile.setFirstName(firstName);
            profile.setLastName(lastName);
            user.setProfile(profile);
            profile = userProfileRepository.save(profile);
        }

        String firstName = requireValue(
                isBlank(profile.getFirstName()) ? request.getFirstName() : profile.getFirstName(),
                "First name is required");

        String lastName = requireValue(
                isBlank(profile.getLastName()) ? request.getLastName() : profile.getLastName(),
                "Last name is required");

        String email = requireValue(
                user.getEmail(), "Email is required");

        String phone = requireValue(
                isBlank(user.getPhone()) ? request.getPhone() : user.getPhone(),
                "A phone number is required for ABA PayWay.");

        if (firstName.length() > 20
                || lastName.length() > 20
                || email.length() > 50
                || phone.length() > 20) {
            throw new IllegalArgumentException(
                    "Customer information exceeds ABA field limits");
        }

        // 4. Prepare QR request
        String reqTime = getRequestTime();
        String transactionId = generateTransactionId();
        String formattedAmount = amount.toPlainString();

        String purchaseType = "purchase";
        String paymentOption = "abapay_khqr";

        // Base64 encoded JSON array
        String items = Base64.getEncoder().encodeToString(
                "[]".getBytes(StandardCharsets.UTF_8)
        );

        String callbackUrl = null;

        if (!isBlank(config.getCallbackUrl())) {
            callbackUrl = Base64.getEncoder().encodeToString(
                    config.getCallbackUrl().trim()
                            .getBytes(StandardCharsets.UTF_8)
            );
        }

        String returnDeeplink = null;
        String customFields = null;
        String returnParams = null;
        String payout = null;

        String lifetime = "6";
        String qrTemplate = "template3_color";

        // 5. Build ABA hash in exact documented order
        String hashData =
                reqTime
                        + merchantId
                        + transactionId
                        + formattedAmount
                        + items
                        + firstName
                        + lastName
                        + email
                        + phone
                        + purchaseType
                        + paymentOption
                        + (callbackUrl == null ? "" : callbackUrl)
                        + (returnDeeplink == null ? "" : returnDeeplink)
                        + currency
                        + (customFields == null ? "" : customFields)
                        + (returnParams == null ? "" : returnParams)
                        + (payout == null ? "" : payout)
                        + lifetime
                        + qrTemplate;

        String hash = generateHmac(hashData);

        // 6. Build JSON payload
        Map<String, Object> payload = new LinkedHashMap<>();

        payload.put("req_time", reqTime);
        payload.put("merchant_id", merchantId);
        payload.put("tran_id", transactionId);

        // JSON amount is numeric; hash uses formattedAmount above
        payload.put("amount", amount);

        payload.put("first_name", firstName);
        payload.put("last_name", lastName);
        payload.put("email", email);
        payload.put("phone", phone);

        payload.put("purchase_type", purchaseType);
        payload.put("payment_option", paymentOption);
        payload.put("items", items);
        payload.put("currency", currency);

        payload.put("callback_url", callbackUrl);
        payload.put("return_deeplink", returnDeeplink);
        payload.put("custom_fields", customFields);
        payload.put("return_params", returnParams);
        payload.put("payout", payout);

        payload.put("lifetime", 6);
        payload.put("qr_image_template", qrTemplate);
        payload.put("hash", hash);

        // 7. Call ABA
        Map<String, Object> abaResponse;

        try {
            abaResponse = restClient.post()
                    .uri(qrUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

        } catch (org.springframework.web.client.HttpStatusCodeException e) {

            // Do not log API key or customer details
            throw new IllegalStateException(
                    "ABA QR request failed with HTTP " + e.getStatusCode(), e);
        }

        if (abaResponse == null) {
            throw new IllegalStateException("Empty ABA QR response");
        }

        // 8. Check ABA response
        Map<String, Object> abaStatus =
                asMap(abaResponse.get("status"));

        if (abaStatus == null
                || !"0".equals(stringValue(abaStatus.get("code")))) {

            String message = abaStatus == null
                    ? "Unknown ABA error"
                    : stringValue(abaStatus.get("message"));

            throw new IllegalStateException(
                    "ABA QR generation failed: " + message);
        }

        String qrString = stringValue(abaResponse.get("qrString"));
        String qrImage = stringValue(abaResponse.get("qrImage"));
        String deeplink = stringValue(
                abaResponse.get("abapay_deeplink"));

        if (isBlank(qrString) || isBlank(qrImage)) {
            throw new IllegalStateException(
                    "ABA response does not contain QR image or QR string");
        }

        // 9. Save payment
        Payment payment = new Payment();

        payment.setPaymentNumber(generatePaymentNumber());
        payment.setOrderId(order.getId());
        payment.setTransactionId(transactionId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setPaymentMethod("ABA_KHQR");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCheckoutUrl(qrUrl);

        payment.setQrString(qrString);
        payment.setQrImage(qrImage);

        payment.setAbaPayDeeplink(
                isBlank(deeplink) ? null : deeplink
        );

        payment.setExpiresAt(
                LocalDateTime.now().plusMinutes(6)
        );

        payment = paymentRepository.save(payment);

        // 10. Update order
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        orderRepository.save(order);


        PaymentResponse response = mapToResponse(payment);

        response.setAppStore(
                stringValue(abaResponse.get("app_store"))
        );

        response.setPlayStore(
                stringValue(abaResponse.get("play_store"))
        );

        return response;

    }



    // =====================================================
    // 6. CALLBACK SIGNATURE
    // =====================================================

    /*
     * Keep this implementation only if it matches the callback
     * signature specification ABA has provided for your account.
     */

    private String generateCallbackSignature(
            Map<String, Object> callback
    ) {

        Map<String, Object> sorted = new TreeMap<>(callback);

        StringBuilder data = new StringBuilder();

        for (Object value : sorted.values()) {
            if (value != null) {
                data.append(value);
            }
        }

        return generateHmac(data.toString());
    }

    // =====================================================
    // 7. HMAC SHA512
    // =====================================================

    private String generateHmac(String data) {

        try {
            String apiKey = requireValue(
                    config.getApiKey(),
                    "ABA API Key is missing"
            );

            Mac mac = Mac.getInstance("HmacSHA512");

            SecretKeySpec secretKey = new SecretKeySpec(
                    apiKey.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"
            );

            mac.init(secretKey);

            byte[] hashBytes = mac.doFinal(
                    data.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getEncoder().encodeToString(hashBytes);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Cannot generate ABA HMAC",
                    e
            );
        }
    }
    // =====================================================
    // 8. CONFIGURATION VALIDATION
    // =====================================================

    private void validatePurchaseConfiguration() {

        if (isBlank(config.getMerchantId())
                || isBlank(config.getApiKey())
                || isBlank(config.getPurchaseUrl())
                || isBlank(config.getCurrency())) {

            throw new IllegalStateException(
                    "ABA PayWay Purchase configuration is incomplete"
            );
        }

        String currency = config.getCurrency().trim();

        if (!"USD".equalsIgnoreCase(currency)
                && !"KHR".equalsIgnoreCase(currency)) {

            throw new IllegalStateException(
                    "ABA currency must be USD or KHR"
            );
        }
    }

    // =====================================================
    // 9. REQUEST TIME FOR CHECK TRANSACTION
    // =====================================================

    private String getRequestTime() {
        return LocalDateTime.now(ZoneOffset.UTC)
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    // =====================================================
    // 10. GENERATE IDS
    // =====================================================

    private String generateTransactionId() {

        return "NIT" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 17)
                .toUpperCase();
    }

    private String generatePaymentNumber() {

        return "PAY-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    // =====================================================
    // 11. MAP PAYMENT RESPONSE
    // =====================================================


    private PaymentResponse mapToResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(payment.getId());
        response.setOrderId(payment.getOrderId());
        response.setTransactionId(payment.getTransactionId());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());

        response.setStatus(
                payment.getStatus() != null
                        ? payment.getStatus().name()
                        : null
        );

        response.setPaymentMethod(payment.getPaymentMethod());
        response.setCheckoutUrl(payment.getCheckoutUrl());

        // Get QR information from Payment entity
        response.setQrString(payment.getQrString());
        response.setQrImage(payment.getQrImage());
        response.setAbaPayDeeplink(payment.getAbaPayDeeplink());

        response.setExpiresAt(payment.getExpiresAt());

        return response;
    }


    // =====================================================
    // 12. MAP / STRING HELPERS
    // =====================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {

        if (value instanceof Map<?, ?>) {
            return (Map<String, Object>) value;
        }

        return null;
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String requireValue(String value, String errorMessage) {

        if (value == null || value.isBlank()) {
            throw new IllegalStateException(errorMessage);
        }

        return value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

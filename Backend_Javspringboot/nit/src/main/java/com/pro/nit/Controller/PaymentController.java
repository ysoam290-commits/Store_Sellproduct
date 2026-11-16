
package com.pro.nit.Controller;

import com.pro.nit.DTO.payment.PaymentRequest;
import com.pro.nit.DTO.payment.PaymentResponse;
import com.pro.nit.Service.PaymentService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000"
})
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Create ABA KHQR Payment
    @PostMapping("/khqr")
    public ResponseEntity<PaymentResponse> createKhqrPayment(
            @RequestBody PaymentRequest request,
            Authentication authentication) {

        PaymentResponse response =
                paymentService.createQrPayment(request, authentication.getName());

        return ResponseEntity.ok(response);
    }

    // Check payment status
    @GetMapping("/{paymentId}/status")
    public ResponseEntity<PaymentResponse> checkPaymentStatus(
            @PathVariable Long paymentId,
            Authentication authentication) {

        PaymentResponse response =
                paymentService.verifyPayment(paymentId, authentication.getName());

        return ResponseEntity.ok(response);
    }
}

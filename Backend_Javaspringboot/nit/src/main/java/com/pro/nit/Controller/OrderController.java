
package com.pro.nit.Controller;

import com.pro.nit.DTO.order.OrderRequest;
import com.pro.nit.DTO.order.OrderResponse;
import com.pro.nit.Service.OrderService;
import com.pro.nit.Entity.User;
import com.pro.nit.Repository.UserRepository;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
})
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    // ==========================================
    // CREATE ORDER
    // ==========================================
    @PostMapping("/{userId}")
    public ResponseEntity<OrderResponse> createOrder(
            @PathVariable Long userId,
            @Valid @RequestBody OrderRequest request,
            Authentication authentication
    ) {

        String username = authentication.getName();
        User authenticatedUser = username.contains("@")
                ? userRepository.findByEmailIgnoreCase(username).orElse(null)
                : userRepository.findByPhone(username).orElse(null);
        if (authenticatedUser == null || !authenticatedUser.getId().equals(userId)) {
            throw new AccessDeniedException("Orders can only be created for the authenticated customer.");
        }

        OrderResponse response =
                orderService.createOrder(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // CANCEL ORDER
    // ==========================================
    @PatchMapping("/{orderId}/cancel/{userId}")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            @PathVariable Long userId
    ) {

        OrderResponse response =
                orderService.cancelOrder(orderId, userId);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId
    ) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    // ==========================================
    // GET ORDER BY ORDER NUMBER
    // ==========================================
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByNumber(
            @PathVariable String orderNumber
    ) {

        return ResponseEntity.ok(
                orderService.getOrderByNumber(orderNumber)
        );
    }

    // ==========================================
    // GET ALL ORDERS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    // ==========================================
    // GET ORDERS BY USER
    // ==========================================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                orderService.getOrdersByUser(userId)
        );
    }
}

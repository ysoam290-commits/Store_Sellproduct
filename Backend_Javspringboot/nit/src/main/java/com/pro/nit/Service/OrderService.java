
package com.pro.nit.Service;

import com.pro.nit.DTO.order.OrderItemRequest;
import com.pro.nit.DTO.order.OrderItemResponse;
import com.pro.nit.DTO.order.OrderRequest;
import com.pro.nit.DTO.order.OrderResponse;

import com.pro.nit.Entity.Order;
import com.pro.nit.Entity.OrderItem;
import com.pro.nit.Entity.Product;
import com.pro.nit.Entity.User;

import com.pro.nit.Repository.OrderRepository;
import com.pro.nit.Repository.ProductRepository;
import com.pro.nit.Repository.UserRepository;

import com.pro.nit.Exception.InsufficientStockException;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // CREATE ORDER
    // ==========================================
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {

        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (request == null ||
                request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Order must contain at least one product"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "User not found: " + userId
                        )
                );

        Order order = new Order();

        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setNote(request.getNote());
        order.setTotalAmount(BigDecimal.ZERO);
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.UNPAID);

        List<OrderItem> orderItems = new ArrayList<>();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest.getProductId() == null) {
                throw new IllegalArgumentException(
                        "Product ID is required"
                );
            }

            Integer requestedQuantity = itemRequest.getQuantity();

            if (requestedQuantity == null || requestedQuantity <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than zero"
                );
            }

            Product product = productRepository.findById(
                    itemRequest.getProductId()
            ).orElseThrow(() ->
                    new EntityNotFoundException(
                            "Product not found: " +
                                    itemRequest.getProductId()
                    )
            );

            if (!Boolean.TRUE.equals(product.getStatus())) {
                throw new IllegalStateException(
                        "Product is not available: " +
                                product.getProductName()
                );
            }

            if (product.getQuantity() < requestedQuantity) {
                throw new InsufficientStockException(
                        "Not enough stock for: " +
                                product.getProductName()
                );
            }

            if (product.getPrice() == null ||
                    product.getPrice() <= 0) {

                throw new IllegalStateException(
                        "Invalid product price: " +
                                product.getProductName()
                );
            }

            BigDecimal unitPrice =
                    BigDecimal.valueOf(product.getPrice());

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(requestedQuantity)
            );

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getProductName());
            orderItem.setQuantity(requestedQuantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);

            totalAmount = totalAmount.add(subtotal);

            // Reduce product stock
            product.setQuantity(
                    product.getQuantity() - requestedQuantity
            );
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // ==========================================
    // CANCEL ORDER
    // ==========================================
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {

        // 1. Validate IDs
        if (orderId == null || userId == null) {
            throw new IllegalArgumentException(
                    "Order ID and User ID are required"
            );
        }

        // 2. Find Order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Order not found: " + orderId
                        )
                );

        // 3. Check Order Owner
        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException(
                    "You are not allowed to cancel this order"
            );
        }

        // 4. Check Order Status
        if (order.getOrderStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be cancelled"
            );
        }

        // 5. Check Payment Status
        if (order.getPaymentStatus() != Order.PaymentStatus.UNPAID) {
            throw new IllegalStateException(
                    "Only UNPAID orders can be cancelled"
            );
        }

        // 6. Restore Product Stock
        for (OrderItem item : order.getOrderItems()) {

            Product product = item.getProduct();

            if (product == null) {
                throw new IllegalStateException(
                        "Product not found for order item: " + item.getId()
                );
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalStateException(
                        "Invalid order item quantity: " + item.getId()
                );
            }

            int restoredStock =
                    product.getQuantity() + item.getQuantity();

            product.setQuantity(restoredStock);

            productRepository.save(product);
        }

        // 7. Update Order Status
        order.setOrderStatus(Order.OrderStatus.CANCELLED);

        // 8. Save Cancelled Order
        Order cancelledOrder = orderRepository.save(order);

        // 9. Return Order Response
        return mapToResponse(cancelledOrder);
    }

    // ==========================================
    // GET ORDER BY ID
    // ==========================================
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Order not found: " + orderId
                        )
                );

        return mapToResponse(order);
    }

    // ==========================================
    // GET ORDER BY ORDER NUMBER
    // ==========================================
    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Order not found: " + orderNumber
                        )
                );

        return mapToResponse(order);
    }

    // ==========================================
    // GET ALL ORDERS
    // ==========================================
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ==========================================
    // GET ORDERS BY USER
    // ==========================================
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {

        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ==========================================
    // MAP ENTITY TO RESPONSE
    // ==========================================
    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> items = order.getOrderItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        null,
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getShippingAddress(),
                order.getNote(),
                items,
                order.getTotalAmount(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}

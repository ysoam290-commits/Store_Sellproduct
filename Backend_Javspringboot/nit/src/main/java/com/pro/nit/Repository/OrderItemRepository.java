
package com.pro.nit.Repository;

import com.pro.nit.Entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    // Find all items by Order ID
    List<OrderItem> findByOrderId(Long orderId);

    // Find all items by Product ID
    List<OrderItem> findByProductId(Long productId);

    // Delete all items belonging to an Order
    void deleteByOrderId(Long orderId);

    // Check whether Order has items
    boolean existsByOrderId(Long orderId);
}

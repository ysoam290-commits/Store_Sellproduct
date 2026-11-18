
package com.pro.nit.Repository;

import com.pro.nit.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForPaymentUpdate(@Param("id") Long id);

    List<Order> findByUserId(Long userId);

    List<Order> findByOrderStatus(Order.OrderStatus orderStatus);

    List<Order> findByUserIdAndOrderStatus(
            Long userId,
            Order.OrderStatus orderStatus
    );

    boolean existsByOrderNumber(String orderNumber);
}

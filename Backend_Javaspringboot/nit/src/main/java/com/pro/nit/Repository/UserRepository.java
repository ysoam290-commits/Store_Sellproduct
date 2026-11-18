
package com.pro.nit.Repository;

import com.pro.nit.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Search by email without case sensitivity
    Optional<User> findByEmailIgnoreCase(String email);

    // Search by phone number
    Optional<User> findByPhone(String phone);

    // Check whether an email already exists
    boolean existsByEmailIgnoreCase(String email);

    // Check whether a phone number already exists
    boolean existsByPhone(String phone);
}

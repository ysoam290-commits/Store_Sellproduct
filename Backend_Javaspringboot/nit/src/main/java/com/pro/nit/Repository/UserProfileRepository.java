package com.pro.nit.Repository;

import com.pro.nit.Entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    @Query("select profile from UserProfile profile where profile.user.id = :userId")
    Optional<UserProfile> findByUserId(@Param("userId") Long userId);
}

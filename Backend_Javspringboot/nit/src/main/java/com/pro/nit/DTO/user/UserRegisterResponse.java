package com.pro.nit.DTO.user;

import com.pro.nit.Entity.Role;
import com.pro.nit.Entity.UserProfile;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
public class UserRegisterResponse {
    private Long id;
    private String email;
    private String phone;
    private LocalDateTime createAt;

    private UserProfile profile;
    private Set<Role> roles;

}
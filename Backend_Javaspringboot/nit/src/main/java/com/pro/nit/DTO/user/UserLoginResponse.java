package com.pro.nit.DTO.user;

import com.pro.nit.Entity.UserProfile;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class UserLoginResponse {

    private Long id;
    private String email;
    private String phone;
    private LocalDateTime createAt;

    private UserProfile profile;

    private List<String> roles;
    private List<String> permission;

    private String accessToken;
    private String refreshToken;
}

package com.pro.nit.DTO.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserLoginRequest {

    @NotBlank(message = "Email or phone is required")
    private String identifier;

    @NotBlank(message = "Password is required")
    private String password;
}


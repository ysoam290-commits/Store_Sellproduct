
package com.pro.nit.DTO.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterRequest {

    @Email(message = "Email format is invalid")
    private String email;

    @Pattern(
            regexp = "^[0-9+()\\- ]{8,16}$",
            message = "Phone must contain 8 to 16 valid characters"
    )
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            max = 72,
            message = "Password must be between 8 and 72 characters"
    )
    private String password;

    private String firstName;
    private String lastName;
    private String gender;

    @Pattern(
            regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$",
            message = "Date of birth must use YYYY-MM-DD format"
    )
    private String dob;

    private String address;
    private String image;

    // Public registration must only create USER accounts.
    private String roleName;
}

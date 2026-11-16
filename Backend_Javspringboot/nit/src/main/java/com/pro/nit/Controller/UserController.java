package com.pro.nit.Controller;

import com.pro.nit.DTO.user.ForgotPasswordRequest;
import com.pro.nit.DTO.user.ResetPasswordRequest;
import com.pro.nit.DTO.user.UserLoginRequest;
import com.pro.nit.DTO.user.UserLoginResponse;
import com.pro.nit.DTO.user.UserRegisterRequest;
import com.pro.nit.DTO.user.UserRegisterResponse;
import com.pro.nit.Service.PasswordResetService;
import com.pro.nit.Service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:5175",
        "http://localhost:5173",
        "http://localhost:3000"
})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody UserRegisterRequest request) {

        try {
            UserRegisterResponse response =
                    userService.registerUser(request);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            safeMessage(
                                    ex.getMessage(),
                                    "Invalid registration details."
                            )
                    ));

        } catch (IllegalStateException ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Registration configuration error."
                    ));
        }
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody UserLoginRequest request) {

        try {
            UserLoginResponse response =
                    userService.login(request);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {

            String message = safeMessage(
                    ex.getMessage(),
                    "Invalid login details."
            );

            if ("Invalid email or password.".equals(message)) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", message));
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("message", message));
        }
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        try {
            String resetToken =
                    passwordResetService.forgotPassword(request);

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "message",
                    "If an account exists for this email, "
                            + "password reset instructions will be provided."
            );

            /*
             * Development testing only.
             * PasswordResetService returns a token only when
             * app.password-reset.dev-mode=true.
             *
             * Never expose reset tokens in production.
             */
            if (resetToken != null) {
                response.put("devResetToken", resetToken);
                response.put(
                        "devOnlyWarning",
                        "Development testing only. "
                                + "Never enable this in production."
                );
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            safeMessage(
                                    ex.getMessage(),
                                    "Invalid email address."
                            )
                    ));

        } catch (IllegalStateException ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Could not send the password reset email."
                    ));
        }
    }

    // =========================
    // RESET PASSWORD
    // =========================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        try {
            passwordResetService.resetPassword(request);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Password reset successfully. You can now sign in."
                    )
            );

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            safeMessage(
                                    ex.getMessage(),
                                    "Invalid or expired reset token."
                            )
                    ));
        }
    }

    // =========================
    // HELPER
    // =========================
    private String safeMessage(
            String message,
            String fallback) {

        if (message == null || message.isBlank()) {
            return fallback;
        }

        return message;
    }
}

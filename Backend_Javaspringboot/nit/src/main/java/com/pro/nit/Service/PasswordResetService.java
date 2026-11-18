
package com.pro.nit.Service;

import com.pro.nit.DTO.user.ForgotPasswordRequest;
import com.pro.nit.DTO.user.ResetPasswordRequest;
import com.pro.nit.Entity.PasswordResetToken;
import com.pro.nit.Entity.User;
import com.pro.nit.Repository.PasswordResetTokenRepository;
import com.pro.nit.Repository.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log =
            LoggerFactory.getLogger(PasswordResetService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.password-reset.dev-mode:false}")
    private boolean devMode;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.from:}")
    private String fromEmail;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {

        if (request == null
                || request.getEmail() == null
                || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        String email = request.getEmail().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElse(null);

        // Do not reveal whether an account exists.
        if (user == null) {
            return null;
        }

        // Remove previous reset tokens.
        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        String token = UUID.randomUUID().toString();

        LocalDateTime expiryDate =
                LocalDateTime.now().plusMinutes(30);

        PasswordResetToken resetToken =
                new PasswordResetToken(token, user, expiryDate);

        tokenRepository.saveAndFlush(resetToken);

        // Development only: return the token instead of sending email.
        if (devMode) {
            log.info("Password reset token generated in development mode.");
            return token;
        }

        String resetLink = frontendUrl
                + "/reset-password?token="
                + token;

        try {
            sendResetEmail(user.getEmail(), resetLink);
        } catch (MailException | MessagingException ex) {
            log.error(
                    "Failed to send password reset email. Check SMTP configuration.",
                    ex
            );

            throw new IllegalStateException(
                    "Could not send the password reset email.",
                    ex
            );
        }

        return null;
    }

    private void sendResetEmail(
            String recipientEmail,
            String resetLink
    ) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        if (fromEmail != null && !fromEmail.isBlank()) {
            helper.setFrom(fromEmail);
        }

        helper.setTo(recipientEmail);
        helper.setSubject("Reset Your Password");

        String html = """
                <html>
                  <body>
                    <h2>Password Reset</h2>
                    <p>You requested to reset your password.</p>
                    <p>This link expires in 30 minutes.</p>
                    <p>
                      <a href="%s">Reset My Password</a>
                    </p>
                    <p>
                      If you did not request this, you can ignore this email.
                    </p>
                  </body>
                </html>
                """.formatted(resetLink);

        helper.setText(html, true);

        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Reset password request is required."
            );
        }

        if (request.getToken() == null
                || request.getToken().isBlank()) {
            throw new IllegalArgumentException(
                    "Reset token is required."
            );
        }

        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "New password is required."
            );
        }

        if (newPassword.length() < 8 || newPassword.length() > 72) {
            throw new IllegalArgumentException(
                    "Password must contain between 8 and 72 characters."
            );
        }

        if (confirmPassword == null
                || !newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException(
                    "Passwords do not match."
            );
        }

        PasswordResetToken resetToken =
                tokenRepository.findByToken(request.getToken().trim())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid or expired reset token."
                                )
                        );

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException(
                    "This reset token has already been used."
            );
        }

        if (resetToken.getExpiryDate() == null
                || !resetToken.getExpiryDate()
                .isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "This reset token has expired. Please request a new one."
            );
        }

        User user = resetToken.getUser();

        // Store the encoded password, never plain text.
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // A token can only be used once.
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}

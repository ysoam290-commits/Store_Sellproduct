
package com.pro.nit.Service;

import com.pro.nit.DTO.user.UserLoginRequest;
import com.pro.nit.DTO.user.UserLoginResponse;
import com.pro.nit.DTO.user.UserRegisterRequest;
import com.pro.nit.DTO.user.UserRegisterResponse;

import com.pro.nit.Entity.Role;
import com.pro.nit.Entity.User;
import com.pro.nit.Entity.UserProfile;

import com.pro.nit.Repository.UserRepository;
import com.pro.nit.Repository.RoleRepository;

import com.pro.nit.Security.JwtUtil;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // =========================================
    // REGISTER
    // =========================================

    @Transactional
    public UserRegisterResponse registerUser(UserRegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration details are required."
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "Password is required."
            );
        }

        // Normalize email
        String email = normalize(request.getEmail());

        if (email != null) {
            email = email.toLowerCase(Locale.ROOT);

            if (userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException(
                        "Email is already registered."
                );
            }
        }

        // Normalize phone
        String phone = normalize(request.getPhone());

        if (phone != null) {
            if (userRepository.existsByPhone(phone)) {
                throw new IllegalArgumentException(
                        "Phone is already registered."
                );
            }
        }

        if (email == null && phone == null) {
            throw new IllegalArgumentException(
                    "Email or phone is required."
            );
        }

        // Public registration can only create USER accounts.
        Role userRole = roleRepository
                .findByNameIgnoreCase("USER")
                .orElseThrow(() ->
                        new IllegalStateException(
                                "USER role is missing from the database."
                        )
                );

        // =====================================
        // 1. Create User
        // =====================================

        User user = new User();

        user.setEmail(email);
        user.setPhone(phone);

        // Always encode password for new users
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setActive(true);

        HashSet<Role> roles = new HashSet<>();
        roles.add(userRole);

        user.setRoles(roles);

        // =====================================
        // 2. Create UserProfile
        // =====================================

        UserProfile profile = new UserProfile();

        profile.setFirstName(normalize(request.getFirstName()));
        profile.setLastName(normalize(request.getLastName()));
        profile.setGender(normalize(request.getGender()));
        profile.setAddress(normalize(request.getAddress()));
        profile.setImage(normalize(request.getImage()));

        profile.setDob(parseDob(request.getDob()));

        // =====================================
        // 3. Connect User and UserProfile
        // =====================================

        profile.setUser(user);
        user.setProfile(profile);

        // =====================================
        // 4. Save User and Profile
        // =====================================

        User savedUser = userRepository.save(user);

        // =====================================
        // 5. Build Registration Response
        // =====================================

        UserRegisterResponse response = new UserRegisterResponse();

        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setCreateAt(savedUser.getCreateAt());
        response.setProfile(savedUser.getProfile());
        response.setRoles(savedUser.getRoles());

        return response;
    }

    // =========================================
    // LOGIN
    // =========================================

    // Changed from readOnly = true because legacy
    // password migration needs to update the database.
    @Transactional
    public UserLoginResponse login(UserLoginRequest req) {

        if (req == null
                || req.getIdentifier() == null
                || req.getIdentifier().isBlank()
                || req.getPassword() == null
                || req.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Email/phone and password are required."
            );
        }

        String identifier = req.getIdentifier().trim();
        String rawPassword = req.getPassword();

        User user;

        // =====================================
        // Find user by email or phone
        // =====================================

        if (identifier.contains("@")) {

            user = userRepository
                    .findByEmailIgnoreCase(
                            identifier.toLowerCase(Locale.ROOT)
                    )
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Invalid email or password."
                            )
                    );

        } else {

            user = userRepository
                    .findByPhone(identifier)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Invalid email or password."
                            )
                    );
        }

        // =====================================
        // Check account status
        // =====================================

        if (!user.isActive()) {
            throw new IllegalArgumentException(
                    "Your account is inactive."
            );
        }

        // =====================================
        // Validate and migrate password
        // =====================================

        String storedPassword = user.getPassword();

        if (storedPassword == null || storedPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        boolean passwordValid = false;

        // 1. Check BCrypt password first
        if (isBcryptPassword(storedPassword)) {

            passwordValid = passwordEncoder.matches(
                    rawPassword,
                    storedPassword
            );

        } else {

            // 2. Temporary support for legacy plain-text accounts
            passwordValid = Objects.equals(
                    rawPassword,
                    storedPassword
            );

            // 3. Upgrade legacy password to BCrypt automatically
            if (passwordValid) {

                String upgradedPassword =
                        passwordEncoder.encode(rawPassword);

                user.setPassword(upgradedPassword);

                userRepository.save(user);
            }
        }

        // 4. Reject invalid password
        if (!passwordValid) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        // =====================================
        // Get Roles
        // =====================================

        List<Role> userRoles = user.getRoles() == null
                ? List.of()
                : user.getRoles().stream()
                .filter(Objects::nonNull)
                .toList();

        List<String> roles = userRoles.stream()
                .map(Role::getName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .map(name -> name.toUpperCase(Locale.ROOT))
                .distinct()
                .toList();

        // =====================================
        // Get Permissions
        // =====================================

        List<String> permissions = userRoles.stream()
                .filter(role -> role.getPermissions() != null)
                .flatMap(role -> role.getPermissions().stream())
                .filter(Objects::nonNull)
                .map(permission -> permission.getName())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        // =====================================
        // Generate JWT
        // =====================================

        String username = user.getEmail() != null
                && !user.getEmail().isBlank()
                ? user.getEmail()
                : user.getPhone();

        if (username == null || username.isBlank()) {
            throw new IllegalStateException(
                    "User email and phone are both missing."
            );
        }

        String accessToken = jwtUtil.generationAccessToken(
                username,
                roles,
                permissions
        );

        String refreshToken =
                jwtUtil.generationRefreshToken(username);

        // =====================================
        // Build Login Response
        // =====================================

        UserLoginResponse response = new UserLoginResponse();

        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setCreateAt(user.getCreateAt());
        response.setProfile(user.getProfile());
        response.setRoles(roles);
        response.setPermission(permissions);
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);

        return response;
    }

    // =========================================
    // HELPER: Detect BCrypt format
    // =========================================

    private boolean isBcryptPassword(String password) {

        return password != null
                && (password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$"));
    }

    // =========================================
    // HELPER: Normalize String
    // =========================================

    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    // =========================================
    // HELPER: Convert DOB
    // =========================================

    private LocalDate parseDob(String dob) {

        if (dob == null || dob.isBlank()) {
            return null;
        }

        try {

            return LocalDate.parse(dob.trim());

        } catch (DateTimeParseException exception) {

            throw new IllegalArgumentException(
                    "Date of birth must use YYYY-MM-DD format."
            );
        }
    }
}

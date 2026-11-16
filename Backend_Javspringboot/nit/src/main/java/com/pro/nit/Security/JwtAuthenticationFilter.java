
package com.pro.nit.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // Skip public authentication endpoints and OPTIONS requests.
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return request.getMethod().equalsIgnoreCase("OPTIONS")
                || path.equals("/api/auth/login")
                || path.equals("/api/auth/register")
                || path.equals("/api/auth/forgot-password")
                || path.equals("/api/auth/reset-password");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token: let Spring Security decide.
        if (authHeader == null || authHeader.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check Bearer prefix.
        if (!authHeader.regionMatches(
                true, 0, "Bearer ", 0, 7
        )) {

            sendUnauthorized(
                    response,
                    "Invalid authorization header."
            );
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isBlank()) {
            sendUnauthorized(
                    response,
                    "Missing authentication token."
            );
            return;
        }

        try {

            // DEBUG: Verify secret fingerprint.
            System.out.println(
                    "========== JWT VERIFY DEBUG =========="
            );

            System.out.println(
                    "REQUEST PATH: " + request.getServletPath()
            );

            System.out.println(
                    "VERIFY SECRET FINGERPRINT: "
                            + jwtUtil.getJwtSecretFingerprint()
            );

            System.out.println(
                    "RECEIVED TOKEN ID: "
                            + jwtUtil.getTokenFingerprint(token)
            );

            // Validate JWT signature and expiration.
            Claims claims = jwtUtil.extractClaims(token);

            String username = claims.getSubject();

            if (username == null || username.isBlank()) {

                sendUnauthorized(
                        response,
                        "Invalid token subject."
                );
                return;
            }

            List<SimpleGrantedAuthority> authorities =
                    new ArrayList<>();

            // Read roles from JWT.
            Object rolesObject = claims.get("roles");

            if (rolesObject instanceof List<?> roles) {

                for (Object role : roles) {

                    if (role == null) {
                        continue;
                    }

                    String roleName = role.toString()
                            .trim()
                            .toUpperCase(Locale.ROOT);

                    if (roleName.isBlank()) {
                        continue;
                    }

                    if (!roleName.startsWith("ROLE_")) {
                        roleName = "ROLE_" + roleName;
                    }

                    authorities.add(
                            new SimpleGrantedAuthority(roleName)
                    );
                }
            }

            // Read permissions from JWT.
            Object permissionsObject = claims.get("permissions");

            if (permissionsObject instanceof List<?> permissions) {

                for (Object permission : permissions) {

                    if (permission == null) {
                        continue;
                    }

                    String permissionName =
                            permission.toString().trim();

                    if (!permissionName.isBlank()) {

                        authorities.add(
                                new SimpleGrantedAuthority(permissionName)
                        );
                    }
                }
            }

            // Create authenticated user.
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            System.out.println("JWT VERIFY SUCCESS");
            System.out.println(
                    "======================================"
            );

        } catch (JwtException | IllegalArgumentException ex) {

            System.err.println(
                    "========== JWT ERROR =========="
            );

            System.err.println(
                    "Exception: "
                            + ex.getClass().getSimpleName()
            );

            System.err.println(
                    "Message: " + ex.getMessage()
            );

            System.err.println(
                    "================================"
            );

            SecurityContextHolder.clearContext();

            sendUnauthorized(
                    response,
                    "Invalid or expired token."
            );

            return;
        }

        // Continue request outside the JWT try-catch.
        filterChain.doFilter(request, response);
    }

    private void sendUnauthorized(
            HttpServletResponse response,
            String message
    ) throws IOException {

        response.setStatus(
                HttpServletResponse.SC_UNAUTHORIZED
        );

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                "{\"success\":false,\"message\":\""
                        + message
                        + "\"}"
        );
    }
}

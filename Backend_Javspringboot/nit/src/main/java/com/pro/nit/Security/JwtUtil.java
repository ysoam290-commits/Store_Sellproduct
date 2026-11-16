
package com.pro.nit.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.util.Date;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretKey;

    private static final long ACCESS_TOKEN_EXP =
            1000L * 60 * 10;

    private static final long REFRESH_TOKEN_EXP =
            1000L * 60 * 60 * 24 * 7;

    // Get JWT signing key.
    private Key getSigningKey() {

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT secret key is missing. Check app.jwt.secret."
            );
        }

        byte[] keyBytes =
                secretKey.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret key must be at least 32 bytes for HS256."
            );
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Create a safe fingerprint of the JWT secret.
    // Never print the actual secret.
    public String getJwtSecretFingerprint() {

        try {
            byte[] hash = MessageDigest
                    .getInstance("SHA-256")
                    .digest(secretKey.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash, 0, 6);

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Cannot create JWT secret fingerprint.", ex
            );
        }
    }

    // Create a safe fingerprint of a token.
    // Never print the actual token.
    public String getTokenFingerprint(String token) {

        try {
            byte[] hash = MessageDigest
                    .getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash, 0, 6);

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "Cannot create token fingerprint.", ex
            );
        }
    }

    // Generate Access Token.
    public String generationAccessToken(
            String username,
            List<String> roles,
            List<String> permissions
    ) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "Username cannot be empty."
            );
        }

        Map<String, Object> claims = new HashMap<>();

        claims.put(
                "roles",
                roles == null ? List.of() : roles
        );

        claims.put(
                "permissions",
                permissions == null ? List.of() : permissions
        );

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + ACCESS_TOKEN_EXP
                        )
                )
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // Generate Refresh Token.
    public String generationRefreshToken(String username) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "Username cannot be empty."
            );
        }

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + REFRESH_TOKEN_EXP
                        )
                )
                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // Extract and validate JWT Claims.
    public Claims extractClaims(String token) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT token cannot be empty."
            );
        }

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract username from JWT.
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // Check whether token is valid.
    public boolean isTokenValid(String token) {

        try {
            extractClaims(token);
            return true;

        } catch (Exception ex) {
            return false;
        }
    }
}

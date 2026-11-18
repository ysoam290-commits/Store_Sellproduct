
package com.pro.nit.Config;

import com.pro.nit.Entity.User;
import com.pro.nit.Repository.UserRepository;
import com.pro.nit.Security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed frontend origins
        configuration.setAllowedOrigins(List.of(
                "https://store-sellproducts.vercel.app",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
        ));

        // Allowed HTTP methods
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Allowed request headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Cache preflight response for one hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // User Details Service
    @Bean
    public UserDetailsService userDetailsService(
            UserRepository userRepository
    ) {

        return identifier -> {

            String value = identifier.trim();

            User user;

            if (value.contains("@")) {

                user = userRepository
                        .findByEmailIgnoreCase(
                                value.toLowerCase(Locale.ROOT)
                        )
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Account not found."
                                )
                        );

            } else {

                user = userRepository.findByPhone(value)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Account not found."
                                )
                        );
            }

            var authorities = user.getRoles()
                    .stream()
                    .map(role -> {

                        String name = role.getName().trim();

                        if (!name.startsWith("ROLE_")) {
                            name = "ROLE_" + name;
                        }

                        return new SimpleGrantedAuthority(name);
                    })
                    .toList();

            String username = user.getEmail() != null
                    && !user.getEmail().isBlank()
                    ? user.getEmail()
                    : user.getPhone();

            return org.springframework.security.core.userdetails.User
                    .withUsername(username)
                    .password(user.getPassword())
                    .authorities(authorities)
                    .disabled(!user.isActive())
                    .build();
        };
    }

    // Spring Security Filter Chain
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // Enable CORS
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // Stateless JWT authentication
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth

                        // Allow all CORS preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Public Authentication APIs
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // Public uploaded images
                        .requestMatchers("/uploads/**")
                        .permitAll()

                        // Admin-only User Management
                        .requestMatchers(
                                "/api/user",
                                "/api/user/**"
                        ).hasRole("ADMIN")

                        // Admin-only Role Management
                        .requestMatchers(
                                "/api/roles",
                                "/api/roles/**"
                        ).hasRole("ADMIN")

                        // Admin-only Product Creation
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Admin-only Product Update
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Admin-only Product Partial Update
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Admin-only Product Deletion
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Payment APIs require authentication
                        .requestMatchers("/api/payments/**")
                        .authenticated()

                        // All remaining APIs require login
                        .anyRequest().authenticated()
                )

                // JWT Authentication Filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}

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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "https://store-sellproducts.vercel.app"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

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

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                // Suitable for stateless JWT authentication.
                // Do not disable CSRF if you authenticate using cookies/sessions.
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Allow browser CORS preflight requests.
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Public authentication endpoints.
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // Public uploaded images.
                        .requestMatchers("/uploads/**")
                        .permitAll()

                        // Public product GET endpoints.

                        // Admin-only user and role management endpoints.
                        .requestMatchers("/api/user", "/api/user/**")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/roles",
                                "/api/roles/**"
                        ).hasRole("ADMIN")

                        // Admin-only product creation.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Admin-only product update.
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Admin-only product deletion.
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/products",
                                "/api/products/**"
                        ).hasRole("ADMIN")

                        // Payment endpoints require a valid JWT login.
                        .requestMatchers("/api/payments/**")
                        .authenticated()

                        // All other endpoints require authentication.
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
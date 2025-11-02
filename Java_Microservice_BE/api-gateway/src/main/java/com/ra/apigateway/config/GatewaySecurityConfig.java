package com.ra.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity; // THAY ĐỔI 1
import org.springframework.security.config.web.server.ServerHttpSecurity;         // THAY ĐỔI 2
import org.springframework.security.web.server.SecurityWebFilterChain;            // THAY ĐỔI 3

@Configuration
@EnableWebFluxSecurity // THAY ĐỔI 1: Dùng @EnableWebFluxSecurity thay vì @EnableWebSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) { // THAY ĐỔI 2 & 3
        http
                // Tắt CSRF
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // Cho phép CORS (đã có bean CorsWebFilter)
                .cors(cors -> {})

                // Cấu hình quyền truy cập
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/api/v1/auth/**").permitAll() // Cho phép các đường dẫn auth mà không cần xác thực
                        .pathMatchers("/api/v1/admin/users/by-email/**").permitAll()
                        .pathMatchers("/api/v1/admin/users/change-password/**").permitAll()
//                        .pathMatchers("/api/v1/user/**").hasAuthority("ROLE_USER")
                        .anyExchange().permitAll() //  Cho phép tất cả các yêu cầu khác mà không cần xác thực
                );



        return http.build();
    }
}
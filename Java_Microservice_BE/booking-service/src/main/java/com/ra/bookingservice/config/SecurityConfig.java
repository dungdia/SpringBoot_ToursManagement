package com.ra.bookingservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final InternalRequestFilter internalRequestFilter;

    public SecurityConfig(InternalRequestFilter internalRequestFilter) {
        this.internalRequestFilter = internalRequestFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // mọi request đều được phép, vì filter đã kiểm tra nội bộ
                )
                .addFilterBefore(internalRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

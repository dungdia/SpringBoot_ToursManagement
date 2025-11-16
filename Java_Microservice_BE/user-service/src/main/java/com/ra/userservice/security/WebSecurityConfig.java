package com.ra.userservice.security;

import com.ra.userservice.config.InternalRequestFilter;
import com.ra.userservice.constants.RoleName;
import com.ra.userservice.security.exception.AccessDenied;
import com.ra.userservice.security.exception.JwtEntryPoint;
import com.ra.userservice.security.jwt.JwtProvider;
import com.ra.userservice.security.jwt.JwtTokenFilter;
import com.ra.userservice.security.principle.UserDetailService;
import com.ra.userservice.service.IAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final UserDetailService userDetailService;
    private final JwtEntryPoint jwtEntryPoint;
    private final JwtTokenFilter jwtTokenFilter;
    private final AccessDenied accessDenied;
    private final InternalRequestFilter internalRequestFilter; // thêm filter nội bộ

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        url -> url
                                .requestMatchers("/api/v1/admin/users/by-email/{email}").permitAll()
                                .requestMatchers("/api/v1/admin/users/change-password/{email}").permitAll()
                                .requestMatchers("/api/v1/admin/users/OTP").permitAll()
                                .requestMatchers("/api/v1/admin/users/OTP/change-password-now").permitAll()
                                .requestMatchers("/api/v1/auth/**").permitAll()
                                .requestMatchers("/api/v1/admin/**").hasAnyAuthority(RoleName.ROLE_OWNER.toString(), RoleName.ROLE_ADMIN.toString())
                                .requestMatchers("/api/v1/user/**").hasAuthority(RoleName.ROLE_USER.toString())
                                .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(
                        exception -> exception
                                .authenticationEntryPoint(jwtEntryPoint)
                                .accessDeniedHandler(accessDenied)
                )
                // Thêm filter nội bộ (microservice)
                .addFilterBefore(internalRequestFilter, UsernamePasswordAuthenticationFilter.class)
                // Thêm filter JWT (sau internal)
                .addFilterAfter(jwtTokenFilter, InternalRequestFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder()
    {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider()
    {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration auth) throws Exception
    {
        return auth.getAuthenticationManager();
    }
}


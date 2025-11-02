package com.ra.userservice.security;

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

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtProvider jwtProvider) throws Exception
{
    return http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(
                    url -> url
//                            .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                            .requestMatchers("/api/v1/admin/users/by-email/{email}").permitAll()
                            .requestMatchers(("/api/v1/admin/users/change-password/{email}")).permitAll()
                            .requestMatchers("/api/v1/admin/users/OTP").permitAll()
                            // === BỔ SUNG: Cho phép API login Facebook từ FE ===
                            .requestMatchers("/api/v1/auth/facebook-login").permitAll()
                            .requestMatchers("/api/v1/admin/users/OTP/change-password-now").permitAll()
                            .requestMatchers("/api/v1/auth/**").permitAll()
                            .requestMatchers("/api/v1/admin/**").hasAnyAuthority(RoleName.ROLE_OWNER.toString(), RoleName.ROLE_ADMIN.toString())
                            .requestMatchers("/api/v1/user/**").hasAuthority(RoleName.ROLE_USER.toString())
                            .anyRequest().authenticated()
            )
//            .oauth2Login(oauth2 -> oauth2
//                    .successHandler((request, response, authentication) -> {
//                        OAuth2User user = (OAuth2User) authentication.getPrincipal();
//                        String email = user.getAttribute("email");
//                        String name = user.getAttribute("name");
//
//                        var ctx = org.springframework.web.context.support.WebApplicationContextUtils
//                                .getRequiredWebApplicationContext(request.getServletContext());
//                        var authService = ctx.getBean(com.ra.userservice.service.IAuthService.class);
//
//                        response.setContentType("application/json");
//                        response.setCharacterEncoding("UTF-8");
//
//                        try {
//                            var jwtResponse = authService.loginWithGoogle(email, name);
//
//                            // Trả về full JWTResponse dưới dạng JSON
//                            var json = String.format(
//                                    "{" +
//                                            "\"accessToken\":\"%s\"," +
//                                            "\"type\":\"%s\"," +
//                                            "\"expired\":%d," +
//                                            "\"email\":\"%s\"," +
//                                            "\"fullName\":\"%s\"," +
//                                            "\"phone\":\"%s\"," +
//                                            "\"address\":\"%s\","+
//                                            "\"roles\":%s," +
//                                            "\"status\":%s" +
//                                            "}",
//                                    jwtResponse.getAccessToken(),
//                                    jwtResponse.getType(),
//                                    jwtResponse.getExpired(),
//                                    jwtResponse.getEmail(),
//                                    jwtResponse.getFullName(),
//                                    jwtResponse.getPhone() != null ? jwtResponse.getPhone() : "",
//                                    jwtResponse.getAddress()!=null?jwtResponse.getAddress():"",
//                                    new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(jwtResponse.getRoles()),
//                                    jwtResponse.getStatus()
//                            );
//                            response.getWriter().write(json);
//
//                        } catch (com.ra.userservice.exception.CustomException e) {
//                            // Nếu có lỗi (VD: tài khoản bị khóa)
//                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//                            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
//                        }
//                    })
//            )

            .authenticationProvider(authenticationProvider())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(
                    exception -> exception
                            .authenticationEntryPoint(jwtEntryPoint)
                            .accessDeniedHandler(accessDenied)
            )
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
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


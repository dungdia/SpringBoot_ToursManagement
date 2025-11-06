package com.ra.userservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class InternalRequestFilter extends OncePerRequestFilter {

    @Value("${app.internal.secret}")
    private String internalSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String secret = request.getHeader("X-Internal-Secret");

        // Nếu là request nội bộ
        if (secret != null && secret.equals(internalSecret)) {
            // Lấy role (nếu có) từ header
            String userRole = request.getHeader("X-User-Role");

            // Gắn quyền tương ứng
            List<GrantedAuthority> authorities = new ArrayList<>();
            if (userRole != null) {
                // Cho phép nhiều role, ngăn cách bởi dấu phẩy
                String[] roles = userRole.split(",");
                for (String role : roles) {
                    authorities.add(new SimpleGrantedAuthority(role.trim()));
                }
            }

            System.out.println("Internal request detected with roles: " + authorities);

            // Tạo Authentication ảo
            Authentication internalAuth =
                    new UsernamePasswordAuthenticationToken("internal-service", null, authorities);

            // Gán vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(internalAuth);
        }

        // Cho phép tiếp tục chuỗi filter
        filterChain.doFilter(request, response);
    }
}

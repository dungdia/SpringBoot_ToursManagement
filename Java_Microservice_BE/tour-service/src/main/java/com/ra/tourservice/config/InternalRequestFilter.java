package com.ra.tourservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
@Component
public class InternalRequestFilter  extends OncePerRequestFilter {
    @Value("${app.internal.secret}")
    private String internalSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException
    {
        String secret = request.getHeader("X-Internal-Secret");
        if (secret == null || !secret.equals(internalSecret)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized internal request");
            return;
        }
        filterChain.doFilter(request, response);
    }
}

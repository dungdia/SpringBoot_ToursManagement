package com.ra.bookingservice.security.annotation;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
public class RoleCheckAspect {

    @Around("@annotation(requireRole)")
    public Object checkRole(ProceedingJoinPoint joinPoint, RequireRole requireRole) throws Throwable {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs.getRequest();

        String roles = request.getHeader("X-User-Role");

        // Nếu không có role => chặn
        if (roles == null) {
            log.warn("Missing X-User-Role header");
            return ResponseEntity.status(403).body("Thiếu thông tin quyền truy cập.");
        }

        // Kiểm tra xem user có 1 trong các role được phép không
        for (String allowedRole : requireRole.value()) {
            if (roles.contains(allowedRole)) {
                return joinPoint.proceed(); // Có quyền -> tiếp tục
            }
        }

        log.warn("Truy cập bị chặn. Roles hiện tại: {}", roles);
        return ResponseEntity.status(403).body("Bạn không có quyền truy cập tài nguyên này.");
    }
}

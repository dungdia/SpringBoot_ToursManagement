package com.ra.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {
    // Khởi tạo Logger
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class); // Thêm Logger

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Value("${app.internal.secret}")
    private String internalSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getPath().toString();

        // Bỏ qua kiểm tra JWT cho các route public (ví dụ login, register,...)
        if (path.startsWith("/api/v1/auth")
                || path.startsWith("/api/v1/admin/users/by-email")
                || path.startsWith("/api/v1/admin/users/change-password")
                || path.startsWith("/api/v1/admin/users/OTP")
                ||path.startsWith("/api/v1/admin/users/OTP/change-password-now")
              )
        {
            System.out.println("🔓 Public path detected: " + path);
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
//            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Lấy danh sách roles từ claim
            Object rawRoles = claims.get("roles");
            List<String> roles = new ArrayList<>();

            if (rawRoles instanceof List<?>) {
                for (Object r : (List<?>) rawRoles) {
                    roles.add(r.toString());
                }
            }

            // Gắn thêm X-User-Email và X-Internal-Secret để gửi tới service con
            exchange = exchange.mutate()
                    .request(exchange.getRequest().mutate()
                            .header("X-User-Email", claims.getSubject())
                            .header("X-User-Role", String.join(",", roles))
                            .header("X-Internal-Secret", internalSecret) // Thêm header bí mật cho các yêu cầu nội bộ
                            .build())
                    .build();

            return chain.filter(exchange);

        } catch (Exception e) {
            // QUAN TRỌNG: Log lại ngoại lệ để xem nguyên nhân 401
            logger.error("JWT Validation Failed for path {}: {}", path, e.getMessage());
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        // Giá trị nhỏ hơn nghĩa là chạy sớm hơn trong pipeline của Gateway
        return -1;
    }
}

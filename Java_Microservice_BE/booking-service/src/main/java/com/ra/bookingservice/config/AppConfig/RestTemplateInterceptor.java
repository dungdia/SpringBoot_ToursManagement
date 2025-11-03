package com.ra.bookingservice.config.AppConfig;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

public class RestTemplateInterceptor implements ClientHttpRequestInterceptor {

    private final String internalSecret;

    public RestTemplateInterceptor(String internalSecret) {
        this.internalSecret = internalSecret;
    }

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                                        ClientHttpRequestExecution execution) throws IOException {
        // 💡 Thêm Header Secret Key vào mọi yêu cầu đi
        request.getHeaders().add("X-Internal-Secret", internalSecret);
        // Lấy header  X-User-Role TỪ request đang xử lý
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attrs != null) {
            HttpServletRequest currentRequest = attrs.getRequest();
            String userRoles = currentRequest.getHeader("X-User-Role"); // Lấy Role từ request đến

            if (userRoles != null) {
                // Truyền header X-User-Role sang request mới
                request.getHeaders().add("X-User-Role", userRoles);
            }
        }
        return execution.execute(request, body);
    }
}
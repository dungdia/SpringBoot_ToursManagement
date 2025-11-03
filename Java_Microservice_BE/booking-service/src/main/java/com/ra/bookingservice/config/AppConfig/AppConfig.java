package com.ra.bookingservice.config.AppConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${app.internal.secret}")
    private String areaServiceSecret;

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // Đăng ký Interceptor
        restTemplate.getInterceptors().add(new RestTemplateInterceptor(areaServiceSecret));
        return restTemplate;
    }
}

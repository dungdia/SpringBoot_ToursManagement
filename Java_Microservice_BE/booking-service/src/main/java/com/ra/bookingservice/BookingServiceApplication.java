package com.ra.bookingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient // để kích hoạt Service Discovery giúp ứng dụng đăng ký với Eureka
public class BookingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingServiceApplication.class, args);
    }

    @Bean
    @LoadBalanced // cho phép RestTemplate phân giải tên dịch vụ qua Eureka
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

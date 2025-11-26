package com.ra.tourservice.config.CloudinaryConfig;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    // 🔑 Chỉ cần tiêm (inject) CLOUDINARY_URL
    @Value("${CLOUDINARY_URL}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary getCloudinary() {
        return new Cloudinary(cloudinaryUrl);
    }
}
package com.ra.areaservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CustomException  extends Exception{
    private final HttpStatus status;

    // Constructor với message và status
    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    // Constructor chỉ có message, gán HttpStatus mặc định
    public CustomException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST; // HttpStatus mặc định
    }
}

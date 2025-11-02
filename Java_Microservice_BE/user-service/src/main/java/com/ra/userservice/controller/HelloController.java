package com.ra.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users/{id}")
public class HelloController {
    @GetMapping
    public String userInfo(@PathVariable Long id) {
        return "User info for user id: " + id;
    }
}

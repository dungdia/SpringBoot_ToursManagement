package com.ra.bookingservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/bookings/{id}")
public class BookingController {
    @Autowired
     private RestTemplate restTemplate;

    @GetMapping
    public String bookingInfo(@PathVariable Long id) {
        String slot = restTemplate.getForObject("http://SLOT-SERVICE/slots/1", String.class);
        return "Booking info for booking id: " + id + ", " + slot;
    }
}

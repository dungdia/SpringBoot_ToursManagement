package com.ra.slotservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/slots/{id}")
public class SlotController {
    @Autowired
    private RestTemplate restTemplate;

    @GetMapping
    public String slotInfo(@PathVariable Long id) {
        String tour = restTemplate.getForObject("http://TOUR-SERVICE/tours/1", String.class);

        return "Slot info for slot id: " + id + ", " + tour;
    }
}

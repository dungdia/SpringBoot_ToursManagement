package com.ra.bookingservice.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ra.bookingservice.constants.Gender;
import jakarta.persistence.*;
import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Customers")
public class Customers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;
    @Column(name = "age", nullable = false)
    private Long age;
    @Column(name = "phone")
    private String phone;
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude // Tránh vòng lặp khi gọi toString()
    @EqualsAndHashCode.Exclude // Tránh vòng lặp khi so sánh
    private Bookings booking;
}

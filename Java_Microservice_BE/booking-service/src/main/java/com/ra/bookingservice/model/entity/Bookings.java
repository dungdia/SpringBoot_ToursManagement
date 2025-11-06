package com.ra.bookingservice.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ra.bookingservice.constants.Status;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bookings")
public class Bookings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;

    @OneToMany(
            mappedBy = "booking", // Trỏ đến tên trường 'booking' trong Customers
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY // Thường là LAZY để tránh tải dữ liệu không cần thiết
    )
    @JsonIgnore
    @ToString.Exclude // Tránh vòng lặp khi gọi toString()
    @EqualsAndHashCode.Exclude // Tránh vòng lặp khi so sánh
    private List<Customers> customers;

    @Column(name = "day_detail_id", nullable = false)
    private Long dayDetailId;

    @Enumerated(EnumType.STRING)
    private Status status;
}

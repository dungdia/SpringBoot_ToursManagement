package com.ra.tourservice.model.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "day_details")
public class DayDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Date departureDate;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private Date returnDate;
    @Min(0)
    @Max(200)
    private Long slot;
    private Long price;
    private Boolean status;

    // Thêm khóa ngoại trỏ về Entity cha (Days)
    @ManyToOne(fetch = FetchType.LAZY)// Liên kết nhiều-đến-một với Days
    @JoinColumn(name = "tours_id", nullable = false)
    @JsonIgnore // Ngăn chặn vòng lặp vô hạn khi serializing
    private Tours tour ;
}

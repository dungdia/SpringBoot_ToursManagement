package com.ra.tourservice.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tours")
public class Tours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "tour_name", nullable = false, length = 200)
    private String tourName;

    @Column(name = "area_id")
    private Long areaId;

    @ManyToMany(
            fetch = FetchType.EAGER,
            cascade = {CascadeType.PERSIST, CascadeType.MERGE} // Áp dụng các thao tác PERSIST và MERGE
    )
    @JoinTable(
            name = "tours_images",
            joinColumns = @JoinColumn(name = "tours_id"),
            inverseJoinColumns = @JoinColumn(name = "images_id")
    )
    private Set<Images> images;

    @OneToMany(
            mappedBy = "tour", // Liên kết với trường 'day' trong DayDetails
            cascade = CascadeType.ALL, // Áp dụng tất cả các thao tác (bao gồm PERSIST, REMOVE)
            orphanRemoval = true, // Đảm bảo xóa con khi xóa cha
            fetch = FetchType.LAZY // Tải ngay lập tức các DayDetails khi tải Days
    )
    private List<DayDetails> dayDetails;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

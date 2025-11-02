package com.ra.userservice.model.entity;

import com.ra.userservice.constants.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.util.Set;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    @Column(name = "email", nullable = false, unique = true, length = 100)
    @Email(message = "Email không đúng định dạng")
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    @Column(name = "phone", length = 25, unique = true)
    private String phone;
    private String address;
    private Boolean status;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Roles> roles;
}

package com.pharmacy.posbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String genericName;

    private String brand;

    private String dosageForm; // e.g., Tablet, Syrup, Capsule

    private String strength;   // e.g., 500mg, 10ml

    private boolean prescriptionRequired;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}

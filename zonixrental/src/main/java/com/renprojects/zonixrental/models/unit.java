package com.renprojects.zonixrental.models;

import com.renprojects.zonixrental.models.dedicated.lease;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "units")
public class unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String unitNumber;
    @Column(nullable = false)
    private String floor;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isOccupied = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "unit", fetch = FetchType.LAZY)
    private List<lease> leases = new ArrayList<>();



}

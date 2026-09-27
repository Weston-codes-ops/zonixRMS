package com.renprojects.zonixrental.models.dedicated;

import com.renprojects.zonixrental.enums.leaseStatus;
import com.renprojects.zonixrental.models.unit;
import com.renprojects.zonixrental.models.Resident;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "leases")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class lease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String leaseNumber;

    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal rent;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private leaseStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private unit unit;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "lease_residents",
            joinColumns = @JoinColumn(name = "lease_id"),
            inverseJoinColumns = @JoinColumn(name = "resident_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_lease_resident",
                    columnNames = {"lease_id", "resident_id"}))
    private List<Resident> residents = new ArrayList<>();
}

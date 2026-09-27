package com.renprojects.zonixrental.models;


import com.renprojects.zonixrental.enums.issueCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "maintenance_tickets")
public class maintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String ticketNumber;

    @Column(nullable = false)
    private String issue;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private issueCategory issueCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_staff_id")
    private User reportedByStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_resident_id")
    private Resident reportedByResident;

    @CreationTimestamp
    private LocalDateTime reportedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isSolved = false;

    private LocalDateTime solvedAt;

    private BigDecimal amount;

}

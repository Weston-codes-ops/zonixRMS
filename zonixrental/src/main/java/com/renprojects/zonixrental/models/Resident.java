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
import java.util.UUID;

@Entity
@Table(name = "residents", uniqueConstraints = {
        @UniqueConstraint(name = "uk_residents_whatsapp_number", columnNames = "whatsapp_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resident {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String surname;

    @Column(name = "whatsapp_number", nullable = false, length = 16)
    private String whatsappNumber;

    @Builder.Default
    @Column(nullable = false)
    private boolean whatsappNumberVerified = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean whatsappUpdatesConsented = false;

    private LocalDateTime whatsappConsentRecordedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    @ManyToMany(mappedBy = "residents")
    private List<lease> leases = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "paidBy")
    private List<payment> payments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "reportedByResident")
    private List<maintenanceTicket> maintenanceTickets = new ArrayList<>();
}
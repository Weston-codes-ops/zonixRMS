package com.renprojects.zonixrental.models;

import com.renprojects.zonixrental.models.dedicated.lease;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name ="payments")
public class payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String transactionRef;

    @Column(nullable = false)
    private BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lease_id", nullable = false)
    private lease lease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paid_by_resident_id", nullable = false)
    private Resident paidBy;


}

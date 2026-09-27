package com.renprojects.zonixrental.repositories;

import com.renprojects.zonixrental.models.payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentRepository extends JpaRepository<payment, UUID> {
}

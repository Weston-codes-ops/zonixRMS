package com.renprojects.zonixrental.repositories;

import com.renprojects.zonixrental.models.Resident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    boolean existsByWhatsappNumber(String whatsappNumber);
    boolean existsByWhatsappNumberAndIdNot(String whatsappNumber, UUID id);
}
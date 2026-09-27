package com.renprojects.zonixrental.repositories;

import com.renprojects.zonixrental.models.maintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MaintenanceTicketRepository extends JpaRepository<maintenanceTicket, UUID> {
}

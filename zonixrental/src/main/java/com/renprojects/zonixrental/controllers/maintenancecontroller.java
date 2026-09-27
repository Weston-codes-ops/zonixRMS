package com.renprojects.zonixrental.controllers;

import com.renprojects.zonixrental.DTOs.requests.MaintenanceRequest;
import com.renprojects.zonixrental.DTOs.response.MaintenanceResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.services.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class maintenancecontroller {

    private final MaintenanceService maintenanceService;

    @PostMapping("/{userId}")
    public ResponseEntity<MaintenanceResponse> createTicket(
            @Valid @RequestBody MaintenanceRequest request,
            @PathVariable UUID userId) {
        MaintenanceResponse response = maintenanceService.createTicket(request, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/resident/{residentId}")
    public ResponseEntity<MaintenanceResponse> createResidentTicket(
            @Valid @RequestBody MaintenanceRequest request,
            @PathVariable UUID residentId) {
        MaintenanceResponse response = maintenanceService.createResidentTicket(request, residentId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> getTicketById(@PathVariable UUID id) {
        MaintenanceResponse response = maintenanceService.getTicketById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>> getAllTickets() {
        List<MaintenanceResponse> responses = maintenanceService.getAllTickets();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<MaintenanceResponse>> getTicketsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(maintenanceService.getTicketsPage(page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MaintenanceResponse> updateTicketStatus(
            @PathVariable UUID id,
            @RequestParam boolean isSolved,
            @RequestParam(required = false) BigDecimal amount) {
        MaintenanceResponse response = maintenanceService.updateTicketStatus(id, isSolved, amount);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id) {
        maintenanceService.deleteTicket(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

package com.renprojects.zonixrental.controllers;

import com.renprojects.zonixrental.DTOs.requests.LeaseRequest;
import com.renprojects.zonixrental.DTOs.response.LeaseResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.services.LeaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leases")
@RequiredArgsConstructor
public class LeaseController {
    private final LeaseService leaseService;

    @PostMapping
    public ResponseEntity<LeaseResponse> createLease(@Valid @RequestBody LeaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaseService.createLease(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaseResponse> getLease(@PathVariable UUID id) {
        return ResponseEntity.ok(leaseService.getLease(id));
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<LeaseResponse>> getLeasesPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(leaseService.getLeasesPage(page, size));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<LeaseResponse> cancelLease(@PathVariable UUID id) {
        return ResponseEntity.ok(leaseService.cancelLease(id));
    }
}
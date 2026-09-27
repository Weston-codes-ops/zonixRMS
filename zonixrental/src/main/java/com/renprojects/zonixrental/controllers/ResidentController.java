package com.renprojects.zonixrental.controllers;

import com.renprojects.zonixrental.DTOs.requests.ResidentRequest;
import com.renprojects.zonixrental.DTOs.requests.ResidentUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.DTOs.response.ResidentResponse;
import com.renprojects.zonixrental.services.ResidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/residents")
@RequiredArgsConstructor
public class ResidentController {
    private final ResidentService residentService;

    @PostMapping
    public ResponseEntity<ResidentResponse> createResident(@Valid @RequestBody ResidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(residentService.createResident(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResidentResponse> getResident(@PathVariable UUID id) {
        return ResponseEntity.ok(residentService.getResident(id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ResidentResponse>> getResidentsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(residentService.getResidentsPage(page, size));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ResidentResponse> updateResident(
            @PathVariable UUID id,
            @Valid @RequestBody ResidentUpdateRequest request) {
        return ResponseEntity.ok(residentService.updateResident(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResident(@PathVariable UUID id) {
        residentService.deleteResident(id);
        return ResponseEntity.noContent().build();
    }
}
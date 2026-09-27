package com.renprojects.zonixrental.controllers;


import com.renprojects.zonixrental.DTOs.requests.UnitRequest;
import com.renprojects.zonixrental.DTOs.requests.UnitUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.UnitResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.services.UnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/units")
@RequiredArgsConstructor
public class unitcontroller {

    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitResponse> createUnit(@Valid @RequestBody UnitRequest request) {
        UnitResponse response = unitService.createUnit(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitResponse> getUnitById(@PathVariable Long id) {
        UnitResponse response = unitService.getUnitById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UnitResponse>> getAllUnits() {
        List<UnitResponse> responses = unitService.getAllUnits();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<UnitResponse>> getUnitsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(unitService.getUnitsPage(page, size));
    }

        @PatchMapping("/{id}")
    public ResponseEntity<UnitResponse> updateUnit(
            @Valid @RequestBody UnitUpdateRequest request,
            @PathVariable Long id) {
        UnitResponse response = unitService.updateUnit(request, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        unitService.deleteUnit(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/vacant")
    public ResponseEntity<List<UnitResponse>> getVacantUnits() {
        List<UnitResponse> responses = unitService.getVacantUnits();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vacant/page")
    public ResponseEntity<PageResponse<UnitResponse>> getVacantUnitsPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(unitService.getVacantUnitsPage(page, size));
    }
}

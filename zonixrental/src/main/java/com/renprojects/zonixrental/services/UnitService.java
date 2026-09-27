package com.renprojects.zonixrental.services;


import com.renprojects.zonixrental.DTOs.requests.UnitRequest;
import com.renprojects.zonixrental.DTOs.requests.UnitUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.UnitResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.exceptions.ConflictException;
import com.renprojects.zonixrental.exceptions.NotFoundException;
import com.renprojects.zonixrental.models.unit;
import com.renprojects.zonixrental.repositories.UnitRepository;
import com.renprojects.zonixrental.pagination.PageRequestFactory;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        String unitNumber = request.unitNumber().trim().toUpperCase(Locale.ROOT);
        if (unitRepository.findByUnitNumber(unitNumber).isPresent()) {
            throw new ConflictException("A unit with this unit number already exists.");
        }

        unit newUnit = unit.builder()
            .unitNumber(unitNumber)
            .floor(request.floor().trim())
                .build();

        unitRepository.save(newUnit);
        return toResponse(newUnit);
    }

    @Transactional(readOnly = true)
    public UnitResponse getUnitById(Long id) {
        unit unit = unitRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Unit not found."));
        return toResponse(unit);
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UnitResponse> getUnitsPage(int page, int size) {
        Page<UnitResponse> units = unitRepository.findAll(PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(units);
    }

    @Transactional
    public UnitResponse updateUnit(UnitUpdateRequest request, Long id) {
        unit existingUnit = unitRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Unit not found."));

        if (request.unitNumber() != null) {
            String unitNumber = request.unitNumber().trim().toUpperCase(Locale.ROOT);
            unitRepository.findByUnitNumber(unitNumber)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new ConflictException("A unit with this unit number already exists.");
                    });
            existingUnit.setUnitNumber(unitNumber);
        }
        if (request.floor() != null) existingUnit.setFloor(request.floor().trim());
        unitRepository.save(existingUnit);
        return toResponse(existingUnit);
    }

    @Transactional
    public void deleteUnit(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new NotFoundException("Unit not found.");
        }
        unitRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> getVacantUnits() {
        return unitRepository.findByIsOccupiedFalse().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UnitResponse> getVacantUnitsPage(int page, int size) {
        Page<UnitResponse> units = unitRepository.findByIsOccupiedFalse(PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(units);
    }

    private UnitResponse toResponse(unit unit) {
        return new UnitResponse(
            unit.getId(),
                unit.getUnitNumber(),
            unit.getFloor(),
                unit.getIsOccupied()
        );
    }
}

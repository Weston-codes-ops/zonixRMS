package com.renprojects.zonixrental.services;

import com.renprojects.zonixrental.DTOs.requests.LeaseRequest;
import com.renprojects.zonixrental.DTOs.response.LeaseResidentResponse;
import com.renprojects.zonixrental.DTOs.response.LeaseResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.enums.leaseStatus;
import com.renprojects.zonixrental.exceptions.BadRequestException;
import com.renprojects.zonixrental.exceptions.ConflictException;
import com.renprojects.zonixrental.exceptions.NotFoundException;
import com.renprojects.zonixrental.models.Resident;
import com.renprojects.zonixrental.models.dedicated.lease;
import com.renprojects.zonixrental.models.unit;
import com.renprojects.zonixrental.pagination.PageRequestFactory;
import com.renprojects.zonixrental.repositories.LeaseRepository;
import com.renprojects.zonixrental.repositories.ResidentRepository;
import com.renprojects.zonixrental.repositories.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaseService {
    private static final List<leaseStatus> OPEN_STATUSES = List.of(leaseStatus.PENDING, leaseStatus.ACTIVE);

    private final LeaseRepository leaseRepository;
    private final UnitRepository unitRepository;
    private final ResidentRepository residentRepository;

    @Transactional
    public LeaseResponse createLease(LeaseRequest request) {
        LocalDate today = LocalDate.now();
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("Lease end date must be on or after the start date.");
        }
        if (request.endDate().isBefore(today)) {
            throw new BadRequestException("A new lease cannot end in the past.");
        }

        unit unit = unitRepository.findByIdForUpdate(request.unitId())
                .orElseThrow(() -> new NotFoundException("Unit not found."));
        if (leaseRepository.existsByUnit_IdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                unit.getId(), OPEN_STATUSES, request.endDate(), request.startDate())) {
            throw new ConflictException("This unit already has an overlapping pending or active lease.");
        }

        Set<UUID> residentIds = request.residentIds();
        List<Resident> residents = residentRepository.findAllById(residentIds);
        if (residents.size() != residentIds.size()) {
            throw new NotFoundException("One or more residents were not found.");
        }

        leaseStatus status = request.startDate().isAfter(today) ? leaseStatus.PENDING : leaseStatus.ACTIVE;
        if (status == leaseStatus.ACTIVE && unit.getIsOccupied()) {
            throw new ConflictException("This unit is marked occupied and cannot start another active lease.");
        }

        lease newLease = lease.builder()
                .leaseNumber("LS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .unit(unit)
                .residents(residents)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .rent(request.rent())
                .status(status)
                .build();
        leaseRepository.save(newLease);

        if (status == leaseStatus.ACTIVE) {
            unit.setIsOccupied(true);
            unitRepository.save(unit);
        }
        return toResponse(newLease);
    }

    @Transactional(readOnly = true)
    public LeaseResponse getLease(UUID id) {
        return toResponse(findLease(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<LeaseResponse> getLeasesPage(int page, int size) {
        Page<LeaseResponse> leases = leaseRepository.findAll(PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(leases);
    }

    @Transactional
    public LeaseResponse cancelLease(UUID id) {
        lease lease = findLease(id);
        if (lease.getStatus() == leaseStatus.CANCELLED || lease.getStatus() == leaseStatus.EXPIRED) {
            throw new ConflictException("This lease is already closed.");
        }
        lease.setStatus(leaseStatus.CANCELLED);
        leaseRepository.save(lease);
        refreshUnitOccupancy(lease.getUnit());
        return toResponse(lease);
    }

    @Scheduled(cron = "${app.lease-status-refresh-cron:0 5 0 * * *}")
    @Transactional
    public void refreshLeaseStatuses() {
        LocalDate today = LocalDate.now();
        for (lease lease : leaseRepository.findAllByStatusIn(OPEN_STATUSES)) {
            if (lease.getEndDate().isBefore(today)) {
                lease.setStatus(leaseStatus.EXPIRED);
            } else if (!lease.getStartDate().isAfter(today)) {
                lease.setStatus(leaseStatus.ACTIVE);
            }
            refreshUnitOccupancy(lease.getUnit());
        }
    }

    private void refreshUnitOccupancy(unit unit) {
        boolean occupied = leaseRepository.existsByUnit_IdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                unit.getId(), List.of(leaseStatus.ACTIVE), LocalDate.now(), LocalDate.now());
        unit.setIsOccupied(occupied);
        unitRepository.save(unit);
    }

    private lease findLease(UUID id) {
        return leaseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Lease not found."));
    }

    private LeaseResponse toResponse(lease lease) {
        List<LeaseResidentResponse> residents = lease.getResidents().stream()
                .map(resident -> new LeaseResidentResponse(
                        resident.getId(),
                        resident.getFirstName() + " " + resident.getSurname(),
                        resident.getWhatsappNumber()))
                .toList();
        return new LeaseResponse(
                lease.getId(),
                lease.getLeaseNumber(),
                lease.getUnit().getId(),
                lease.getUnit().getUnitNumber(),
                lease.getStartDate(),
                lease.getEndDate(),
                lease.getRent(),
                lease.getStatus(),
                residents);
    }
}
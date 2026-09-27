package com.renprojects.zonixrental.services;

import com.renprojects.zonixrental.DTOs.requests.ResidentRequest;
import com.renprojects.zonixrental.DTOs.requests.ResidentUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.DTOs.response.ResidentResponse;
import com.renprojects.zonixrental.exceptions.BadRequestException;
import com.renprojects.zonixrental.exceptions.ConflictException;
import com.renprojects.zonixrental.exceptions.NotFoundException;
import com.renprojects.zonixrental.models.Resident;
import com.renprojects.zonixrental.pagination.PageRequestFactory;
import com.renprojects.zonixrental.repositories.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResidentService {
    private final ResidentRepository residentRepository;

    @Transactional
    public ResidentResponse createResident(ResidentRequest request) {
        String whatsappNumber = normalizeNumber(request.whatsappNumber());
        if (residentRepository.existsByWhatsappNumber(whatsappNumber)) {
            throw new ConflictException("A resident with this WhatsApp number already exists.");
        }

        Resident resident = Resident.builder()
                .firstName(request.firstName().trim())
                .surname(request.surname().trim())
                .whatsappNumber(whatsappNumber)
                .whatsappUpdatesConsented(request.whatsappUpdatesConsented())
                .whatsappConsentRecordedAt(request.whatsappUpdatesConsented() ? LocalDateTime.now() : null)
                .build();
        return toResponse(residentRepository.save(resident));
    }

    @Transactional(readOnly = true)
    public ResidentResponse getResident(UUID id) {
        return toResponse(findResident(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ResidentResponse> getResidentsPage(int page, int size) {
        Page<ResidentResponse> residents = residentRepository.findAll(PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(residents);
    }

    @Transactional
    public ResidentResponse updateResident(UUID id, ResidentUpdateRequest request) {
        Resident resident = findResident(id);
        if (request.firstName() == null && request.surname() == null
                && request.whatsappNumber() == null && request.whatsappUpdatesConsented() == null) {
            throw new BadRequestException("Provide at least one resident field to update.");
        }

        if (request.firstName() != null) resident.setFirstName(request.firstName().trim());
        if (request.surname() != null) resident.setSurname(request.surname().trim());
        if (request.whatsappNumber() != null) {
            String whatsappNumber = normalizeNumber(request.whatsappNumber());
            if (residentRepository.existsByWhatsappNumberAndIdNot(whatsappNumber, id)) {
                throw new ConflictException("A resident with this WhatsApp number already exists.");
            }
            if (!resident.getWhatsappNumber().equals(whatsappNumber)) {
                resident.setWhatsappNumber(whatsappNumber);
                resident.setWhatsappNumberVerified(false);
                resident.setWhatsappUpdatesConsented(false);
                resident.setWhatsappConsentRecordedAt(null);
            }
        }
        if (request.whatsappUpdatesConsented() != null
                && resident.isWhatsappUpdatesConsented() != request.whatsappUpdatesConsented()) {
            resident.setWhatsappUpdatesConsented(request.whatsappUpdatesConsented());
            resident.setWhatsappConsentRecordedAt(LocalDateTime.now());
        }
        return toResponse(residentRepository.save(resident));
    }

    @Transactional
    public void deleteResident(UUID id) {
        Resident resident = findResident(id);
        if (!resident.getLeases().isEmpty() || !resident.getPayments().isEmpty()
                || !resident.getMaintenanceTickets().isEmpty()) {
            throw new ConflictException("Residents linked to leases, payments, or maintenance tickets cannot be deleted.");
        }
        residentRepository.delete(resident);
    }

    private Resident findResident(UUID id) {
        return residentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resident not found."));
    }

    private ResidentResponse toResponse(Resident resident) {
        return new ResidentResponse(
                resident.getId(),
                resident.getFirstName(),
                resident.getSurname(),
                resident.getWhatsappNumber(),
                resident.isWhatsappNumberVerified(),
                resident.isWhatsappUpdatesConsented(),
                resident.getWhatsappConsentRecordedAt(),
                resident.getCreatedAt());
    }

    private String normalizeNumber(String whatsappNumber) {
        return whatsappNumber.trim().replace(" ", "").toUpperCase(Locale.ROOT);
    }
}
package com.renprojects.zonixrental.services;

import com.renprojects.zonixrental.DTOs.requests.MaintenanceRequest;
import com.renprojects.zonixrental.DTOs.response.MaintenanceResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.enums.Role;
import com.renprojects.zonixrental.exceptions.BadRequestException;
import com.renprojects.zonixrental.exceptions.NotFoundException;
import com.renprojects.zonixrental.models.User;
import com.renprojects.zonixrental.models.Resident;
import com.renprojects.zonixrental.models.maintenanceTicket;
import com.renprojects.zonixrental.repositories.MaintenanceTicketRepository;
import com.renprojects.zonixrental.repositories.UserRepository;
import com.renprojects.zonixrental.repositories.ResidentRepository;
import com.renprojects.zonixrental.pagination.PageRequestFactory;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTicketRepository maintenanceRepository;
    private final UserRepository userRepository;
    private final ResidentRepository residentRepository;

    @Transactional
    public MaintenanceResponse createTicket(MaintenanceRequest request, UUID userId) {
        User reporter = userRepository.findByIdAndRoleNot(userId, Role.TENANT)
            .orElseThrow(() -> new NotFoundException("Reporter not found."));

        maintenanceTicket newTicket = maintenanceTicket.builder()
                .ticketNumber(ticketNumber())
                .issue(request.issue())
                .issueCategory(request.category())
                .reportedByStaff(reporter)
                .isSolved(false)
                .build();

        maintenanceRepository.save(newTicket);
        return toResponse(newTicket);
    }

    @Transactional
    public MaintenanceResponse createResidentTicket(MaintenanceRequest request, UUID residentId) {
        Resident reporter = residentRepository.findById(residentId)
                .orElseThrow(() -> new NotFoundException("Resident not found."));
        maintenanceTicket ticket = maintenanceTicket.builder()
                .ticketNumber(ticketNumber())
                .issue(request.issue())
                .issueCategory(request.category())
                .reportedByResident(reporter)
                .isSolved(false)
                .build();
        return toResponse(maintenanceRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public MaintenanceResponse getTicketById(UUID id) {
        maintenanceTicket ticket = maintenanceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Maintenance ticket not found."));
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getAllTickets() {
        return maintenanceRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<MaintenanceResponse> getTicketsPage(int page, int size) {
        Page<MaintenanceResponse> tickets = maintenanceRepository.findAll(PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(tickets);
    }

    @Transactional
    public MaintenanceResponse updateTicketStatus(UUID id, boolean isSolved, BigDecimal amount) {
        maintenanceTicket ticket = maintenanceRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Maintenance ticket not found."));

        ticket.setIsSolved(isSolved);
        ticket.setSolvedAt(isSolved ? LocalDateTime.now() : null);
        if (amount != null) {
            ticket.setAmount(amount);
        }

        maintenanceRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional
    public void deleteTicket(UUID id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new NotFoundException("Maintenance ticket not found.");
        }
        maintenanceRepository.deleteById(id);
    }

    private MaintenanceResponse toResponse(maintenanceTicket ticket) {
        UUID reporterId = ticket.getReportedByResident() != null
            ? ticket.getReportedByResident().getId()
            : ticket.getReportedByStaff() == null ? null : ticket.getReportedByStaff().getId();
        String reporterName = ticket.getReportedByResident() != null
            ? ticket.getReportedByResident().getFirstName() + " " + ticket.getReportedByResident().getSurname()
            : ticket.getReportedByStaff() == null ? null
            : ticket.getReportedByStaff().getFirstName() + " " + ticket.getReportedByStaff().getSurName();
        String reporterType = ticket.getReportedByResident() != null ? "RESIDENT" : "STAFF";

        return new MaintenanceResponse(
            ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getIssue(),
                ticket.getIssueCategory(),
                reporterId,
                reporterName,
                reporterType,
                ticket.getReportedAt(),
                ticket.getIsSolved(),
                ticket.getSolvedAt(),
                ticket.getAmount()
        );
    }

    private String ticketNumber() {
        return "MT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

package com.renprojects.zonixrental.DTOs.response;

import com.renprojects.zonixrental.enums.leaseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record LeaseResponse(
        UUID id,
        String leaseNumber,
        Long unitId,
        String unitNumber,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal rent,
        leaseStatus status,
        List<LeaseResidentResponse> residents) {
}
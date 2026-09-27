package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record LeaseRequest(
        @NotNull(message = "Unit ID is required")
        Long unitId,

        @NotEmpty(message = "At least one resident must be assigned to the lease")
        @Size(max = 10, message = "A lease can include at most 10 residents")
        Set<UUID> residentIds,

        @NotNull(message = "Lease start date is required")
        LocalDate startDate,

        @NotNull(message = "Lease end date is required")
        LocalDate endDate,

        @NotNull(message = "Rent is required")
        @DecimalMin(value = "0.01", message = "Rent must be greater than zero")
        @Digits(integer = 10, fraction = 2, message = "Rent supports up to 10 integer digits and 2 decimal places")
        BigDecimal rent) {
}
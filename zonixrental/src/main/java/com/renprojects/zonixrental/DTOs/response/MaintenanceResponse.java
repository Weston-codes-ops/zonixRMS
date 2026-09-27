package com.renprojects.zonixrental.DTOs.response;

import com.renprojects.zonixrental.enums.issueCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MaintenanceResponse(UUID id,
                                  String ticketNumber,
                                  String issue,
                                  issueCategory category,
                                  UUID reportedBy,
                                  String reporterName,
                                  String reporterType,
                                  LocalDateTime reportedAt,
                                  Boolean isSolved,
                                  LocalDateTime solvedAt,
                                  BigDecimal amount) {
}

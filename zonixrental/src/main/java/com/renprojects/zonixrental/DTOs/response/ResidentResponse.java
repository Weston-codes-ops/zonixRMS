package com.renprojects.zonixrental.DTOs.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ResidentResponse(
        UUID id,
        String firstName,
        String surname,
        String whatsappNumber,
        boolean whatsappNumberVerified,
        boolean whatsappUpdatesConsented,
        LocalDateTime whatsappConsentRecordedAt,
        LocalDateTime createdAt) {
}
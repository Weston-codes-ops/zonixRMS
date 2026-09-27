package com.renprojects.zonixrental.DTOs.response;

import java.util.UUID;

public record LeaseResidentResponse(UUID id, String fullName, String whatsappNumber) {
}
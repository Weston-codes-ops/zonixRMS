package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResidentRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 80, message = "First name must not exceed 80 characters")
        String firstName,

        @NotBlank(message = "Surname is required")
        @Size(max = 80, message = "Surname must not exceed 80 characters")
        String surname,

        @NotBlank(message = "WhatsApp number is required")
        @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "WhatsApp number must use international format, for example +254712345678")
        String whatsappNumber,

        boolean whatsappUpdatesConsented) {
}
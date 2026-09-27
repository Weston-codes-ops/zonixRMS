package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResidentUpdateRequest(
        @Pattern(regexp = "(?s).*\\S.*", message = "First name must not be blank")
        @Size(max = 80, message = "First name must not exceed 80 characters")
        String firstName,

        @Pattern(regexp = "(?s).*\\S.*", message = "Surname must not be blank")
        @Size(max = 80, message = "Surname must not exceed 80 characters")
        String surname,

        @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "WhatsApp number must use international format, for example +254712345678")
        String whatsappNumber,

        Boolean whatsappUpdatesConsented) {
}
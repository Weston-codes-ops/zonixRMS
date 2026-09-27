package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Pattern(regexp = "(?s).*\\S.*", message = "First name must not be blank")
        @Size(max = 80, message = "First name must not exceed 80 characters")
        String firstName,

        @Pattern(regexp = "(?s).*\\S.*", message = "Surname must not be blank")
        @Size(max = 80, message = "Surname must not exceed 80 characters")
        String surname,

        @Email(message = "Email must be valid")
        @Pattern(regexp = "(?s).*\\S.*", message = "Email must not be blank")
        @Size(max = 254, message = "Email must not exceed 254 characters")
        String email,

        @Pattern(regexp = "^\\+?[0-9() .-]{7,25}$", message = "Phone must contain 7 to 25 valid phone characters")
        String phone) {
}
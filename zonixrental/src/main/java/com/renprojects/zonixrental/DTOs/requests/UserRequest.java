package com.renprojects.zonixrental.DTOs.requests;

import com.renprojects.zonixrental.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRequest(
    @NotBlank(message = "First name is required")
    @Size(max = 80, message = "First name must not exceed 80 characters")
    String firstName,

    @NotBlank(message = "Surname is required")
    @Size(max = 80, message = "Surname must not exceed 80 characters")
    String surname,

    @Email(message = "Email must be valid")
    @Pattern(regexp = "(?s).*\\S.*", message = "Email must not be blank")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    String email,

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9() .-]{7,25}$", message = "Phone must contain 7 to 25 valid phone characters")
    String phone,

    @NotNull(message = "Role is required")
    Role role) {
}

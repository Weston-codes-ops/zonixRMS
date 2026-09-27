package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UnitUpdateRequest(
        @Pattern(regexp = "(?s).*\\S.*", message = "Unit number must not be blank")
        @Size(max = 30, message = "Unit number must not exceed 30 characters")
        String unitNumber,

        @Pattern(regexp = "(?s).*\\S.*", message = "Floor must not be blank")
        @Size(max = 30, message = "Floor must not exceed 30 characters")
        String floor) {
}
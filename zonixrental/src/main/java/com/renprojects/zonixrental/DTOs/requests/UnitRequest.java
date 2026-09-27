package com.renprojects.zonixrental.DTOs.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnitRequest(
    @NotBlank(message = "Unit number is required")
    @Size(max = 30, message = "Unit number must not exceed 30 characters")
    String unitNumber,

    @NotBlank(message = "Floor is required")
    @Size(max = 30, message = "Floor must not exceed 30 characters")
    String floor) {
}

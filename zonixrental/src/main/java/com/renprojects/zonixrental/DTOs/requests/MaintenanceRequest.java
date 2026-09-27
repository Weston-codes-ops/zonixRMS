package com.renprojects.zonixrental.DTOs.requests;

import com.renprojects.zonixrental.enums.issueCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MaintenanceRequest(
    @NotBlank(message = "Issue description is required")
    @Size(max = 1000, message = "Issue description must not exceed 1000 characters")
    String issue,

    @NotNull(message = "Issue category is required")
    issueCategory category) {
}

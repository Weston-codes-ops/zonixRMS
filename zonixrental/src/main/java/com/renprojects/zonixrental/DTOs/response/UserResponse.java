package com.renprojects.zonixrental.DTOs.response;

import java.util.UUID;

public record UserResponse(UUID id,
                           String fullName,
                           String email,
                           String phone,
                           String role
                           ) {
}

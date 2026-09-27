package com.renprojects.zonixrental.DTOs.response;

public record UnitResponse(Long id,
                           String unitNumber,
                           String floor,
                           Boolean isOccupied) {
}

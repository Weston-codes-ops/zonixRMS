package com.renprojects.zonixrental.controllers;

import com.renprojects.zonixrental.DTOs.requests.UserRequest;
import com.renprojects.zonixrental.DTOs.requests.UserUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.UserResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class usercontroller {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> responses = userService.getAllUsers();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/page")
    public ResponseEntity<PageResponse<UserResponse>> getUsersPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getUsersPage(page, size));
    }

        @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @Valid @RequestBody UserUpdateRequest request,
            @PathVariable UUID id) {
        UserResponse response = userService.updateUser(request, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

package com.renprojects.zonixrental.services;

import com.renprojects.zonixrental.DTOs.requests.UserRequest;
import com.renprojects.zonixrental.DTOs.requests.UserUpdateRequest;
import com.renprojects.zonixrental.DTOs.response.UserResponse;
import com.renprojects.zonixrental.DTOs.response.PageResponse;
import com.renprojects.zonixrental.enums.Role;
import com.renprojects.zonixrental.exceptions.ConflictException;
import com.renprojects.zonixrental.exceptions.BadRequestException;
import com.renprojects.zonixrental.exceptions.NotFoundException;
import com.renprojects.zonixrental.models.User;
import com.renprojects.zonixrental.repositories.UserRepository;
import com.renprojects.zonixrental.pagination.PageRequestFactory;
import org.springframework.data.domain.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (request.role() == Role.TENANT) {
            throw new BadRequestException("Residents must be created through the resident workflow, not as staff accounts.");
        }
        String email = request.email() == null ? null : request.email().trim().toLowerCase(Locale.ROOT);
        if (email != null && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("A user with this email already exists.");
        }

        User newUser = User.builder()
            .firstName(request.firstName().trim())
            .surName(request.surname().trim())
                .email(email)
                .phone(request.phone().trim())
                .role(request.role())
                .build();

        userRepository.save(newUser);
        return toResponse(newUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = findStaffAccount(id);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByRoleNot(Role.TENANT).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsersPage(int page, int size) {
        Page<UserResponse> users = userRepository.findAllByRoleNot(Role.TENANT, PageRequestFactory.create(page, size))
                .map(this::toResponse);
        return PageResponse.from(users);
    }

    @Transactional
    public UserResponse updateUser(UserUpdateRequest request, UUID id) {
        User user = findStaffAccount(id);

        if (request.firstName() == null && request.surname() == null
                && request.email() == null && request.phone() == null) {
            throw new BadRequestException("Provide at least one user field to update.");
        }

        if (request.email() != null) {
            String email = request.email().trim().toLowerCase(Locale.ROOT);
            if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                throw new ConflictException("A user with this email already exists.");
            }
            user.setEmail(email);
        }
        if (request.phone() != null) user.setPhone(request.phone().trim());
        if (request.firstName() != null) user.setFirstName(request.firstName().trim());
        if (request.surname() != null) user.setSurName(request.surname().trim());

        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        userRepository.delete(findStaffAccount(id));
    }

    private User findStaffAccount(UUID id) {
        return userRepository.findByIdAndRoleNot(id, Role.TENANT)
                .orElseThrow(() -> new NotFoundException("Staff account not found."));
    }

    private UserResponse toResponse(User user) {
        String fullName = user.getFirstName() + " " + user.getSurName();
        return new UserResponse(
            user.getId(),
                fullName,
            user.getEmail(),
                user.getPhone(),
                user.getRole().toString()
        );
    }
}

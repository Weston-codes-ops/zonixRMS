package com.renprojects.zonixrental.repositories;

import com.renprojects.zonixrental.models.User;
import com.renprojects.zonixrental.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
	boolean existsByEmailIgnoreCase(String email);
	boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
	Optional<User> findByIdAndRoleNot(UUID id, Role role);
	List<User> findAllByRoleNot(Role role);
	Page<User> findAllByRoleNot(Role role, Pageable pageable);
}

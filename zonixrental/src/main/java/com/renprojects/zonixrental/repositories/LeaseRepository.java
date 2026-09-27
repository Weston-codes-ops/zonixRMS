package com.renprojects.zonixrental.repositories;

import com.renprojects.zonixrental.models.dedicated.lease;
import com.renprojects.zonixrental.enums.leaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface LeaseRepository extends JpaRepository<lease, UUID> {
	boolean existsByUnit_IdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
			Long unitId,
			Collection<leaseStatus> statuses,
			LocalDate requestedEndDate,
			LocalDate requestedStartDate);

	List<lease> findAllByStatusIn(Collection<leaseStatus> statuses);
}

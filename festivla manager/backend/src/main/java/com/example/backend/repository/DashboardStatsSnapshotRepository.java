package com.example.backend.repository;

import com.example.backend.domain.entity.DashboardStatsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardStatsSnapshotRepository extends JpaRepository<DashboardStatsSnapshot, Long> {

    Optional<DashboardStatsSnapshot> findByEventId(Long eventId);
}

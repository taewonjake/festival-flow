package com.example.backend.repository;

import com.example.backend.domain.entity.TableAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TableAssignmentHistoryRepository extends JpaRepository<TableAssignmentHistory, Long> {

    Optional<TableAssignmentHistory> findFirstByTableIdAndEndedAtIsNullOrderByStartedAtDesc(Long tableId);
}

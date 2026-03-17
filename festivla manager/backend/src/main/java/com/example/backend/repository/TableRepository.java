package com.example.backend.repository;

import com.example.backend.domain.entity.Table;
import com.example.backend.domain.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<Table, Long> {

    List<Table> findByEventIdOrderByTableNumberAsc(Long eventId);

    Optional<Table> findByEventIdAndTableNumber(Long eventId, Integer tableNumber);

    boolean existsByEventIdAndTableNumber(Long eventId, Integer tableNumber);

    Long countByEventId(Long eventId);

    Long countByEventIdAndStatus(Long eventId, TableStatus status);
}

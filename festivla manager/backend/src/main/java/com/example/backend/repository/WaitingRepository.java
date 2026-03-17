package com.example.backend.repository;

import com.example.backend.domain.entity.Waiting;
import com.example.backend.domain.enums.WaitingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, Long> {

    Optional<Waiting> findFirstByUserIdAndEventIdAndStatusInOrderByCreatedAtDesc(
            Long userId,
            Long eventId,
            Collection<WaitingStatus> statuses
    );

    List<Waiting> findByEventIdOrderByWaitingNumberAsc(Long eventId);

    List<Waiting> findByEventIdAndStatusOrderByWaitingNumberAsc(Long eventId, WaitingStatus status);

    @Query("""
            SELECT COALESCE(MAX(w.waitingNumber), 0)
            FROM Waiting w
            WHERE w.event.id = :eventId AND w.businessDate = :businessDate
            """)
    Long findMaxWaitingNumberByEventAndBusinessDate(
            @Param("eventId") Long eventId,
            @Param("businessDate") LocalDate businessDate
    );

    Long countByStatus(WaitingStatus status);
    Long countByEventIdAndStatus(Long eventId, WaitingStatus status);

    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.status = :status AND w.createdAt >= :startDate")
    Long countByStatusAndCreatedAtAfter(
            @Param("status") WaitingStatus status,
            @Param("startDate") java.time.LocalDateTime startDate
    );

    @Query("""
            SELECT COUNT(w)
            FROM Waiting w
            WHERE w.event.id = :eventId
              AND w.status = :status
              AND w.createdAt >= :startDate
            """)
    Long countByEventIdAndStatusAndCreatedAtAfter(
            @Param("eventId") Long eventId,
            @Param("status") WaitingStatus status,
            @Param("startDate") java.time.LocalDateTime startDate
    );
}

package com.example.backend.repository;

import com.example.backend.domain.entity.Waiting;
import com.example.backend.domain.enums.WaitingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingRepository extends JpaRepository<Waiting, Long> {

    // 사용자의 대기 중인 웨이팅 조회
    Optional<Waiting> findByUserIdAndStatus(Long userId, WaitingStatus status);

    // 상태별 웨이팅 목록 조회
    List<Waiting> findByStatusOrderByWaitingNumberAsc(WaitingStatus status);

    // 전체 웨이팅 목록 조회 (대기번호순)
    List<Waiting> findAllByOrderByWaitingNumberAsc();

    // 대기 번호로 조회
    Optional<Waiting> findByWaitingNumber(Long waitingNumber);

    // 내 앞의 대기 중인 웨이팅 수 조회
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.status = :status AND w.waitingNumber < :waitingNumber")
    Long countByStatusAndWaitingNumberLessThan(@Param("status") WaitingStatus status, @Param("waitingNumber") Long waitingNumber);

    // 상태별 웨이팅 수 조회
    Long countByStatus(WaitingStatus status);

    // 상태별 및 생성일 이후 웨이팅 수 조회
    @Query("SELECT COUNT(w) FROM Waiting w WHERE w.status = :status AND w.createdAt >= :startDate")
    Long countByStatusAndCreatedAtAfter(@Param("status") WaitingStatus status, @Param("startDate") java.time.LocalDateTime startDate);
}

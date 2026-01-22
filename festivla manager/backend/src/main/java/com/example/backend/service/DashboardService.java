package com.example.backend.service;

import com.example.backend.domain.enums.TableStatus;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.response.DashboardStatsResponse;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.WaitingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final WaitingRepository waitingRepository;
    private final TableRepository tableRepository;

    /**
     * 대시보드 통계 조회
     */
    public DashboardStatsResponse getDashboardStats() {
        // 총 대기 팀 수
        Long totalWaiting = waitingRepository.countByStatus(WaitingStatus.WAITING);

        // 사용 중인 테이블 수
        Long tablesInUse = tableRepository.countByStatus(TableStatus.OCCUPIED);

        // 전체 테이블 수
        Long totalTables = tableRepository.count();

        // 호출 중인 인원 수
        Long calledUsers = waitingRepository.countByStatus(WaitingStatus.CALLED);

        // 오늘 입장 완료 수
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        Long completedToday = waitingRepository.countByStatusAndCreatedAtAfter(
                WaitingStatus.ARRIVED, startOfDay);

        return DashboardStatsResponse.builder()
                .totalWaiting(totalWaiting)
                .tablesInUse(tablesInUse)
                .totalTables(totalTables)
                .calledUsers(calledUsers)
                .completedToday(completedToday)
                .build();
    }
}

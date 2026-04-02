package com.example.backend.service;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.DashboardStatsSnapshot;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.response.DashboardStatsResponse;
import com.example.backend.repository.DashboardStatsSnapshotRepository;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.WaitingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final Duration SNAPSHOT_FRESHNESS = Duration.ofMinutes(2);

    private final WaitingRepository waitingRepository;
    private final TableRepository tableRepository;
    private final EventRepository eventRepository;
    private final DashboardStatsSnapshotRepository dashboardStatsSnapshotRepository;

    @Cacheable(value = "dashboardStats", key = "@cacheKey.dashboard()")
    public DashboardStatsResponse getDashboardStats() {
        Event event = getDefaultEvent();
        Long eventId = event.getId();

        DashboardStatsResponse snapshotResponse = getFreshSnapshot(eventId);
        if (snapshotResponse != null) {
            return snapshotResponse;
        }

        return calculateRealtimeStats(eventId);
    }

    private DashboardStatsResponse getFreshSnapshot(Long eventId) {
        return dashboardStatsSnapshotRepository.findByEventId(eventId)
                .filter(this::isFreshSnapshot)
                .map(this::buildSnapshotResponse)
                .orElse(null);
    }

    private boolean isFreshSnapshot(DashboardStatsSnapshot snapshot) {
        LocalDateTime threshold = LocalDateTime.now().minus(SNAPSHOT_FRESHNESS);
        return !snapshot.getAggregatedAt().isBefore(threshold);
    }

    private DashboardStatsResponse buildSnapshotResponse(DashboardStatsSnapshot snapshot) {
        return DashboardStatsResponse.builder()
                .totalWaiting(snapshot.getTotalWaiting())
                .tablesInUse(snapshot.getTablesInUse())
                .totalTables(snapshot.getTotalTables())
                .calledUsers(snapshot.getCalledUsers())
                .completedToday(snapshot.getCompletedToday())
                .build();
    }

    private DashboardStatsResponse calculateRealtimeStats(Long eventId) {
        Long totalWaiting = waitingRepository.countByEventIdAndStatus(eventId, WaitingStatus.WAITING);
        Long tablesInUse = tableRepository.countByEventIdAndStatus(eventId, TableStatus.OCCUPIED);
        Long totalTables = tableRepository.countByEventId(eventId);
        Long calledUsers = waitingRepository.countByEventIdAndStatus(eventId, WaitingStatus.CALLED);

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        Long completedToday = waitingRepository.countByEventIdAndStatusAndCreatedAtAfter(
                eventId,
                WaitingStatus.ARRIVED,
                startOfDay
        );

        return DashboardStatsResponse.builder()
                .totalWaiting(totalWaiting)
                .tablesInUse(tablesInUse)
                .totalTables(totalTables)
                .calledUsers(calledUsers)
                .completedToday(completedToday)
                .build();
    }

    private Event getDefaultEvent() {
        return eventRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("기본 이벤트가 존재하지 않습니다."));
    }
}

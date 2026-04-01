package com.example.backend.service;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.response.DashboardStatsResponse;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final WaitingRepository waitingRepository;
    private final TableRepository tableRepository;
    private final EventRepository eventRepository;

    @Cacheable(value = "dashboardStats", key = "@cacheKey.dashboard()")
    public DashboardStatsResponse getDashboardStats() {
        Long eventId = getDefaultEvent().getId();
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

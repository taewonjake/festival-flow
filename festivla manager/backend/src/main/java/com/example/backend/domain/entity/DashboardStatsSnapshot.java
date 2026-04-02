package com.example.backend.domain.entity;

import com.example.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "dashboard_stats_snapshot",
        indexes = {
                @Index(name = "idx_dashboard_stats_snapshot_aggregated_at", columnList = "aggregated_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DashboardStatsSnapshot extends BaseTimeEntity {

    @Id
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "total_waiting", nullable = false)
    private Long totalWaiting;

    @Column(name = "tables_in_use", nullable = false)
    private Long tablesInUse;

    @Column(name = "total_tables", nullable = false)
    private Long totalTables;

    @Column(name = "called_users", nullable = false)
    private Long calledUsers;

    @Column(name = "completed_today", nullable = false)
    private Long completedToday;

    @Column(name = "aggregated_at", nullable = false)
    private LocalDateTime aggregatedAt;

    @Builder
    public DashboardStatsSnapshot(
            Long eventId,
            Long totalWaiting,
            Long tablesInUse,
            Long totalTables,
            Long calledUsers,
            Long completedToday,
            LocalDateTime aggregatedAt
    ) {
        this.eventId = eventId;
        this.totalWaiting = totalWaiting;
        this.tablesInUse = tablesInUse;
        this.totalTables = totalTables;
        this.calledUsers = calledUsers;
        this.completedToday = completedToday;
        this.aggregatedAt = aggregatedAt;
    }
}

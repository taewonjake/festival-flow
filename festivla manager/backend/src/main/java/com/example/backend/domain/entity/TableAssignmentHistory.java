package com.example.backend.domain.entity;

import com.example.backend.domain.common.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_assignment_history", indexes = {
        @Index(name = "idx_tah_event_table", columnList = "event_id,table_id"),
        @Index(name = "idx_tah_waiting_id", columnList = "waiting_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TableAssignmentHistory extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private com.example.backend.domain.entity.Table table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waiting_id", nullable = false)
    private Waiting waiting;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Builder
    public TableAssignmentHistory(
            Event event,
            com.example.backend.domain.entity.Table table,
            Waiting waiting,
            LocalDateTime startedAt,
            LocalDateTime endedAt
    ) {
        this.event = event;
        this.table = table;
        this.waiting = waiting;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }

    public void end(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }
}

package com.example.backend.domain.entity;

import com.example.backend.domain.common.BaseTimeEntity;
import com.example.backend.domain.enums.TableStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@jakarta.persistence.Table(
        name = "tables",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_tables_event_table_number",
                        columnNames = {"event_id", "table_number"}
                )
        },
        indexes = {
                @Index(name = "idx_tables_event_status", columnList = "event_id,status")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Table extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TableStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_waiting_id")
    private Waiting currentWaiting;

    @Builder
    public Table(Event event, Integer tableNumber, Integer capacity, TableStatus status, Waiting currentWaiting) {
        this.event = event;
        this.tableNumber = tableNumber;
        this.capacity = capacity;
        this.status = status;
        this.currentWaiting = currentWaiting;
    }

    public void updateStatus(TableStatus status) {
        this.status = status;
    }

    public void assignWaiting(Waiting waiting) {
        this.currentWaiting = waiting;
        this.status = TableStatus.OCCUPIED;
    }

    public void clearWaiting() {
        this.currentWaiting = null;
        this.status = TableStatus.EMPTY;
    }

    public void releaseWaiting() {
        this.currentWaiting = null;
    }

    public void startCleaning() {
        this.status = TableStatus.CLEANING;
    }
}

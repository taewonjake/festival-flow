package com.example.backend.domain.entity;

import com.example.backend.domain.common.BaseTimeEntity;
import com.example.backend.domain.enums.WaitingStatus;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "waitings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_waitings_event_date_number",
                        columnNames = {"event_id", "business_date", "waiting_number"}
                )
        },
        indexes = {
                @Index(name = "idx_waitings_user_id", columnList = "user_id"),
                @Index(name = "idx_waitings_event_date_status", columnList = "event_id,business_date,status"),
                @Index(name = "idx_waitings_event_date_number", columnList = "event_id,business_date,waiting_number")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Waiting extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "head_count", nullable = false)
    private Integer headCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WaitingStatus status;

    @Column(name = "waiting_number", nullable = false)
    private Long waitingNumber;

    @Column(name = "call_time")
    private LocalDateTime callTime;

    @Column(name = "totp_secret", length = 32)
    private String totpSecret;

    @Builder
    public Waiting(
            Event event,
            User user,
            LocalDate businessDate,
            Integer headCount,
            WaitingStatus status,
            Long waitingNumber,
            LocalDateTime callTime,
            String totpSecret
    ) {
        this.event = event;
        this.user = user;
        this.businessDate = businessDate;
        this.headCount = headCount;
        this.status = status;
        this.waitingNumber = waitingNumber;
        this.callTime = callTime;
        this.totpSecret = totpSecret;
    }

    public void updateStatus(WaitingStatus status) {
        this.status = status;
    }

    public void call(LocalDateTime callTime) {
        this.status = WaitingStatus.CALLED;
        this.callTime = callTime;
    }

    public void arrive() {
        this.status = WaitingStatus.ARRIVED;
    }

    public void cancel() {
        this.status = WaitingStatus.CANCELED;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }
}

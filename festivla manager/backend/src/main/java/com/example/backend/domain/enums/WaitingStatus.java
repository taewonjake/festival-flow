package com.example.backend.domain.enums;

public enum WaitingStatus {
    WAITING,    // 대기중
    CALLED,     // 호출됨 (5분 카운트다운 대상)
    ARRIVED,    // 입장완료
    CANCELED    // 취소/노쇼
}

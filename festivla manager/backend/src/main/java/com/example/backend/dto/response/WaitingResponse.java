package com.example.backend.dto.response;

import com.example.backend.domain.enums.WaitingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WaitingResponse {

    private Long waitingId;
    private Long waitingNumber;
    private Integer headCount;
    private WaitingStatus status;
    private Long rank; // 내 앞 남은 팀 수
    private Integer estimatedMinutes; // 예상 대기 시간 (분)
    private LocalDateTime callTime;
    private LocalDateTime createdAt;
    
    // 사용자 정보 (관리자용)
    private Long userId;
    private String userName;
    private String userNickname;
    private String userPhoneNumber;
}

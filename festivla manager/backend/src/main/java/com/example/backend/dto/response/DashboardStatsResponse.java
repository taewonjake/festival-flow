package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatsResponse {
    private Long totalWaiting;      // 총 대기 팀 수
    private Long tablesInUse;       // 사용 중인 테이블 수
    private Long totalTables;       // 전체 테이블 수
    private Long calledUsers;       // 호출 중인 인원 수
    private Long completedToday;    // 오늘 입장 완료 수
}

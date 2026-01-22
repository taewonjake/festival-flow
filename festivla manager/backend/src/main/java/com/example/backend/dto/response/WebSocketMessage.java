package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WebSocketMessage {

    private String type; // WAITING_UPDATE, CALLED, RANK_UPDATE 등
    private Object data;
    private Long timestamp;

    public static WebSocketMessage waitingUpdate(Long rank, Integer estimatedMinutes) {
        return WebSocketMessage.builder()
                .type("WAITING_UPDATE")
                .data(new WaitingUpdateData(rank, estimatedMinutes))
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketMessage called(Long waitingId, String callTime) {
        return WebSocketMessage.builder()
                .type("CALLED")
                .data(new CalledData(waitingId, callTime))
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WebSocketMessage rankUpdate(Long rank, Integer estimatedMinutes) {
        return WebSocketMessage.builder()
                .type("RANK_UPDATE")
                .data(new RankUpdateData(rank, estimatedMinutes))
                .timestamp(System.currentTimeMillis())
                .build();
    }

    // 내부 데이터 클래스
    @Getter
    @lombok.AllArgsConstructor
    public static class WaitingUpdateData {
        private Long rank;
        private Integer estimatedMinutes;
    }

    @Getter
    @lombok.AllArgsConstructor
    public static class CalledData {
        private Long waitingId;
        private String callTime;
    }

    @Getter
    @lombok.AllArgsConstructor
    public static class RankUpdateData {
        private Long rank;
        private Integer estimatedMinutes;
    }
}

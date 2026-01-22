package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class WaitingQueueService {

    private static final String WAITING_QUEUE_KEY = "waiting:queue";
    private final ZSetOperations<String, Object> zSetOperations;

    /**
     * 대기열에 추가
     * @param waitingId 웨이팅 ID
     * @param waitingNumber 대기 번호
     */
    public void addToQueue(Long waitingId, Long waitingNumber) {
        zSetOperations.add(WAITING_QUEUE_KEY, waitingId.toString(), waitingNumber.doubleValue());
    }

    /**
     * 대기열에서 제거
     * @param waitingId 웨이팅 ID
     */
    public void removeFromQueue(Long waitingId) {
        zSetOperations.remove(WAITING_QUEUE_KEY, waitingId.toString());
    }

    /**
     * 대기열 순위 조회 (0부터 시작)
     * @param waitingId 웨이팅 ID
     * @return 순위 (없으면 -1)
     */
    public Long getRank(Long waitingId) {
        Long rank = zSetOperations.rank(WAITING_QUEUE_KEY, waitingId.toString());
        return rank != null ? rank : -1L;
    }

    /**
     * 내 앞의 대기 팀 수 조회
     * @param waitingId 웨이팅 ID
     * @return 내 앞의 대기 팀 수
     */
    public Long getAheadCount(Long waitingId) {
        Long rank = getRank(waitingId);
        return rank != null && rank >= 0 ? rank : 0L;
    }

    /**
     * 대기열 크기 조회
     * @return 대기열 크기
     */
    public Long getQueueSize() {
        Long size = zSetOperations.count(WAITING_QUEUE_KEY, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);
        return size != null ? size : 0L;
    }

    /**
     * 대기열의 첫 번째 항목 조회 (가장 작은 대기 번호)
     * @return 웨이팅 ID (없으면 null)
     */
    public Long getFirstWaitingId() {
        Set<Object> first = zSetOperations.range(WAITING_QUEUE_KEY, 0, 0);
        if (first != null && !first.isEmpty()) {
            return Long.parseLong(first.iterator().next().toString());
        }
        return null;
    }

    /**
     * 대기열 초기화 (테스트용)
     */
    public void clearQueue() {
        zSetOperations.removeRange(WAITING_QUEUE_KEY, 0, -1);
    }
}

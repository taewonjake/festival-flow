package com.example.backend.service;

import com.example.backend.domain.entity.User;
import com.example.backend.domain.entity.Waiting;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.request.WaitingRequest;
import com.example.backend.dto.response.WaitingResponse;
import com.example.backend.dto.response.WebSocketMessage;
import com.example.backend.handler.WaitingWebSocketHandler;
import com.example.backend.repository.WaitingRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitingService {

    private final WaitingRepository waitingRepository;
    private final UserRepository userRepository;
    private final WaitingQueueService waitingQueueService;
    private final WaitingWebSocketHandler waitingWebSocketHandler;
    private final com.example.backend.repository.TableRepository tableRepository;
    private final ChatService chatService;

    private static final int ESTIMATED_MINUTES_PER_TEAM = 10; // 팀당 예상 대기 시간 (분)

    /**
     * 웨이팅 등록
     */
    @Transactional
    public WaitingResponse joinWaiting(Long userId, WaitingRequest request) {
        // 중복 검사: 이미 대기 중인 웨이팅이 있는지 확인
        waitingRepository.findByUserIdAndStatus(userId, WaitingStatus.WAITING)
                .ifPresent(waiting -> {
                    throw new IllegalStateException("이미 대기 중인 웨이팅이 있습니다.");
                });

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 대기 번호 생성 (현재 최대값 + 1)
        Long waitingNumber = generateWaitingNumber();

        // 웨이팅 생성
        Waiting waiting = Waiting.builder()
                .user(user)
                .headCount(request.getHeadCount())
                .status(WaitingStatus.WAITING)
                .waitingNumber(waitingNumber)
                .build();

        waiting = waitingRepository.save(waiting);

        // Redis 대기열에 추가
        waitingQueueService.addToQueue(waiting.getId(), waitingNumber);

        // 응답 생성
        return buildWaitingResponse(waiting);
    }

    /**
     * 내 웨이팅 조회
     */
    public WaitingResponse getMyWaiting(Long userId) {
        // [수정됨] 모든 웨이팅 데이터를 가져와서 직접 찾음 (조회 오류 방지 및 상태 변경 즉시 반영)
        List<Waiting> allWaitings = waitingRepository.findAll();
        
        Waiting waiting = allWaitings.stream()
                .filter(w -> w.getUser().getId().equals(userId))
                .filter(w -> w.getStatus() == WaitingStatus.WAITING || w.getStatus() == WaitingStatus.CALLED)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("대기 중인 웨이팅이 없습니다."));

        WaitingResponse response = buildWaitingResponse(waiting);
        
        // WebSocket으로 순위 업데이트 전송
        if (waiting.getStatus() == WaitingStatus.WAITING) {
            WebSocketMessage message = WebSocketMessage.rankUpdate(response.getRank(), response.getEstimatedMinutes());
            waitingWebSocketHandler.sendToUser(userId, message);
        }
        
        return response;
    }

    /**
     * 대기 목록 조회 (관리자용)
     */
    public List<WaitingResponse> getWaitingList(WaitingStatus status) {
        // 모든 웨이팅을 조회
        List<Waiting> allWaitings = waitingRepository.findAll();
        
        // 스트림으로 필터링 및 정렬 (대기번호 오름차순)
        return allWaitings.stream()
                .filter(w -> status == null || w.getStatus() == status)
                .sorted((w1, w2) -> Long.compare(w1.getWaitingNumber(), w2.getWaitingNumber()))
                .map(this::buildWaitingResponse)
                .collect(Collectors.toList());
    }

    /**
     * 사용자 호출 (관리자용)
     */
    @Transactional
    public WaitingResponse callUser(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        if (waiting.getStatus() != WaitingStatus.WAITING) {
            throw new IllegalStateException("대기 중인 웨이팅만 호출할 수 있습니다.");
        }

        LocalDateTime callTime = LocalDateTime.now();
        waiting.call(callTime);
        waitingRepository.save(waiting);

        // Redis 대기열에서 제거
        waitingQueueService.removeFromQueue(waitingId);

        // WebSocket으로 호출 알림 전송
        WebSocketMessage message = WebSocketMessage.called(
                waiting.getId(),
                callTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
        waitingWebSocketHandler.sendToUser(waiting.getUser().getId(), message);

        // 채팅으로 호출 알림 메시지 전송
        chatService.sendSystemMessage(waiting.getUser().getId(), "관리자가 호출했습니다. 지금 입장해주세요!");

        return buildWaitingResponse(waiting);
    }

    /**
     * 입장 확인 (관리자용)
     */
    @Transactional
    public WaitingResponse confirmEntry(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        if (waiting.getStatus() != WaitingStatus.CALLED) {
            throw new IllegalStateException("호출된 웨이팅만 입장 확인할 수 있습니다.");
        }

        waiting.arrive();
        waitingRepository.save(waiting);

        return buildWaitingResponse(waiting);
    }

    /**
     * 웨이팅 취소 (학생용)
     */
    @Transactional
    public void cancelWaiting(Long waitingId, Long userId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        // 본인의 웨이팅인지 확인
        if (!waiting.getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 웨이팅만 취소할 수 있습니다.");
        }

        // 이미 취소되었거나 입장 완료된 경우 취소 불가
        if (waiting.getStatus() == WaitingStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 웨이팅입니다.");
        }

        if (waiting.getStatus() == WaitingStatus.ARRIVED) {
            throw new IllegalStateException("입장 완료된 웨이팅은 취소할 수 없습니다.");
        }

        // WAITING 상태였던 경우 Redis 대기열에서 제거 (상태 변경 전에 확인)
        boolean wasWaiting = waiting.getStatus() == WaitingStatus.WAITING;
        
        // 상태를 CANCELED로 변경
        waiting.cancel();
        waitingRepository.save(waiting);

        // WAITING 상태였던 경우 Redis 대기열에서 제거
        if (wasWaiting) {
            waitingQueueService.removeFromQueue(waitingId);
        }
    }

    /**
     * 웨이팅 취소 (관리자용)
     */
    @Transactional
    public WaitingResponse cancelWaitingByAdmin(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        // 이미 취소되었거나 입장 완료된 경우 취소 불가
        if (waiting.getStatus() == WaitingStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 웨이팅입니다.");
        }

        if (waiting.getStatus() == WaitingStatus.ARRIVED) {
            throw new IllegalStateException("입장 완료된 웨이팅은 취소할 수 없습니다.");
        }

        // WAITING 상태였던 경우 Redis 대기열에서 제거 (상태 변경 전에 확인)
        boolean wasWaiting = waiting.getStatus() == WaitingStatus.WAITING;
        
        // 상태를 CANCELED로 변경
        waiting.cancel();
        waitingRepository.save(waiting);

        // WAITING 상태였던 경우 Redis 대기열에서 제거
        if (wasWaiting) {
            waitingQueueService.removeFromQueue(waitingId);
        }

        return buildWaitingResponse(waiting);
    }

    /**
     * 테이블 할당 (관리자용)
     */
    @Transactional
    public WaitingResponse assignTable(Long waitingId, Long tableId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("웨이팅을 찾을 수 없습니다."));

        com.example.backend.domain.entity.Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다."));

        // 웨이팅 상태 확인
        if (waiting.getStatus() != WaitingStatus.CALLED && waiting.getStatus() != WaitingStatus.ARRIVED) {
            throw new IllegalStateException("호출된 웨이팅만 테이블을 할당할 수 있습니다.");
        }

        // 테이블 상태 확인
        if (table.getStatus() != com.example.backend.domain.enums.TableStatus.EMPTY) {
            throw new IllegalStateException("빈 테이블만 할당할 수 있습니다.");
        }

        // 테이블에 웨이팅 할당
        table.assignWaiting(waiting);
        tableRepository.save(table);

        // 웨이팅 상태를 ARRIVED로 변경
        if (waiting.getStatus() != WaitingStatus.ARRIVED) {
            waiting.arrive();
            waitingRepository.save(waiting);
        }

        return buildWaitingResponse(waiting);
    }

    /**
     * 대기 번호 생성
     */
    private Long generateWaitingNumber() {
        List<Waiting> allWaitings = waitingRepository.findAll();
        if (allWaitings.isEmpty()) {
            return 1L;
        }
        Long maxNumber = allWaitings.stream()
                .mapToLong(Waiting::getWaitingNumber)
                .max()
                .orElse(0L);
        return maxNumber + 1;
    }

    /**
     * WaitingResponse 생성
     */
    private WaitingResponse buildWaitingResponse(Waiting waiting) {
        Long rank = 0L;
        Integer estimatedMinutes = 0;

        if (waiting.getStatus() == WaitingStatus.WAITING) {
            // Redis에서 순위 조회
            rank = waitingQueueService.getAheadCount(waiting.getId());
            estimatedMinutes = (int) (rank * ESTIMATED_MINUTES_PER_TEAM);
        }

        return WaitingResponse.builder()
                .waitingId(waiting.getId())
                .waitingNumber(waiting.getWaitingNumber())
                .headCount(waiting.getHeadCount())
                .status(waiting.getStatus())
                .rank(rank)
                .estimatedMinutes(estimatedMinutes)
                .callTime(waiting.getCallTime())
                .createdAt(waiting.getCreatedAt())
                .userId(waiting.getUser().getId())
                .userName(waiting.getUser().getName())
                .userNickname(waiting.getUser().getNickname())
                .userPhoneNumber(waiting.getUser().getPhoneNumber())
                .build();
    }
}

package com.example.backend.service;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.TableAssignmentHistory;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.entity.Waiting;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.request.WaitingRequest;
import com.example.backend.dto.response.WaitingResponse;
import com.example.backend.dto.response.WebSocketMessage;
import com.example.backend.handler.WaitingWebSocketHandler;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TableAssignmentHistoryRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WaitingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaitingService {

    private static final List<WaitingStatus> ACTIVE_WAITING_STATUSES = List.of(
            WaitingStatus.WAITING,
            WaitingStatus.CALLED
    );
    private static final List<WaitingStatus> STUDENT_VISIBLE_WAITING_STATUSES = List.of(
            WaitingStatus.WAITING,
            WaitingStatus.CALLED,
            WaitingStatus.ARRIVED
    );
    private static final int ESTIMATED_MINUTES_PER_TEAM = 10;

    private final WaitingRepository waitingRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final WaitingQueueService waitingQueueService;
    private final WaitingWebSocketHandler waitingWebSocketHandler;
    private final com.example.backend.repository.TableRepository tableRepository;
    private final TableAssignmentHistoryRepository tableAssignmentHistoryRepository;
    private final ChatService chatService;

    @Transactional
    public WaitingResponse joinWaiting(Long userId, WaitingRequest request) {
        Event event = getDefaultEvent();
        LocalDate businessDate = LocalDate.now();

        waitingRepository.findFirstByUserIdAndEventIdAndStatusInOrderByCreatedAtDesc(
                userId,
                event.getId(),
                ACTIVE_WAITING_STATUSES
        ).ifPresent(waiting -> {
            throw new IllegalStateException("Active waiting already exists.");
        });

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Long waitingNumber = generateWaitingNumber(event.getId(), businessDate);

        Waiting waiting = Waiting.builder()
                .event(event)
                .user(user)
                .businessDate(businessDate)
                .headCount(request.getHeadCount())
                .status(WaitingStatus.WAITING)
                .waitingNumber(waitingNumber)
                .build();

        waiting = waitingRepository.save(waiting);
        waitingQueueService.addToQueue(waiting.getId(), waitingNumber);
        return buildWaitingResponse(waiting);
    }

    public WaitingResponse getMyWaiting(Long userId) {
        Long eventId = getDefaultEvent().getId();
        Waiting waiting = waitingRepository.findFirstByUserIdAndEventIdAndStatusInOrderByCreatedAtDesc(
                        userId,
                        eventId,
                        STUDENT_VISIBLE_WAITING_STATUSES
                )
                .orElseThrow(() -> new IllegalArgumentException("Active waiting not found."));

        WaitingResponse response = buildWaitingResponse(waiting);
        if (waiting.getStatus() == WaitingStatus.WAITING) {
            WebSocketMessage message = WebSocketMessage.rankUpdate(response.getRank(), response.getEstimatedMinutes());
            waitingWebSocketHandler.sendToUser(userId, message);
        }
        return response;
    }

    public List<WaitingResponse> getWaitingList(WaitingStatus status) {
        Long eventId = getDefaultEvent().getId();
        List<Waiting> waitings = (status == null)
                ? waitingRepository.findByEventIdOrderByWaitingNumberAsc(eventId)
                : waitingRepository.findByEventIdAndStatusOrderByWaitingNumberAsc(eventId, status);

        return waitings.stream()
                .map(this::buildWaitingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WaitingResponse callUser(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("Waiting not found."));

        if (waiting.getStatus() != WaitingStatus.WAITING) {
            throw new IllegalStateException("Only WAITING users can be called.");
        }

        LocalDateTime callTime = LocalDateTime.now();
        waiting.call(callTime);
        waitingRepository.save(waiting);
        waitingQueueService.removeFromQueue(waitingId);

        WebSocketMessage message = WebSocketMessage.called(
                waiting.getId(),
                callTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
        waitingWebSocketHandler.sendToUser(waiting.getUser().getId(), message);
        chatService.sendSystemMessage(waiting.getUser().getId(), "You have been called. Please enter now.");

        return buildWaitingResponse(waiting);
    }

    @Transactional
    public WaitingResponse confirmEntry(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("Waiting not found."));

        if (waiting.getStatus() != WaitingStatus.CALLED) {
            throw new IllegalStateException("Only CALLED users can be confirmed.");
        }

        waiting.arrive();
        waitingRepository.save(waiting);
        return buildWaitingResponse(waiting);
    }

    @Transactional
    public void cancelWaiting(Long waitingId, Long userId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("Waiting not found."));

        if (!waiting.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Only owner can cancel.");
        }
        if (waiting.getStatus() == WaitingStatus.CANCELED) {
            throw new IllegalStateException("Waiting already canceled.");
        }
        if (waiting.getStatus() == WaitingStatus.ARRIVED) {
            throw new IllegalStateException("ARRIVED waiting cannot be canceled.");
        }

        boolean wasWaiting = waiting.getStatus() == WaitingStatus.WAITING;
        waiting.cancel();
        waitingRepository.save(waiting);

        if (wasWaiting) {
            waitingQueueService.removeFromQueue(waitingId);
        }
    }

    @Transactional
    public WaitingResponse cancelWaitingByAdmin(Long waitingId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("Waiting not found."));

        if (waiting.getStatus() == WaitingStatus.CANCELED) {
            throw new IllegalStateException("Waiting already canceled.");
        }
        if (waiting.getStatus() == WaitingStatus.ARRIVED) {
            throw new IllegalStateException("ARRIVED waiting cannot be canceled.");
        }

        boolean wasWaiting = waiting.getStatus() == WaitingStatus.WAITING;
        waiting.cancel();
        waitingRepository.save(waiting);

        if (wasWaiting) {
            waitingQueueService.removeFromQueue(waitingId);
        }

        return buildWaitingResponse(waiting);
    }

    @Transactional
    public WaitingResponse assignTable(Long waitingId, Long tableId) {
        Waiting waiting = waitingRepository.findById(waitingId)
                .orElseThrow(() -> new IllegalArgumentException("Waiting not found."));

        com.example.backend.domain.entity.Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Table not found."));

        if (waiting.getStatus() != WaitingStatus.CALLED && waiting.getStatus() != WaitingStatus.ARRIVED) {
            throw new IllegalStateException("Only CALLED/ARRIVED waiting can be assigned.");
        }
        if (table.getStatus() != com.example.backend.domain.enums.TableStatus.EMPTY) {
            throw new IllegalStateException("Only EMPTY table can be assigned.");
        }
        if (!table.getEvent().getId().equals(waiting.getEvent().getId())) {
            throw new IllegalStateException("Table and waiting must belong to same event.");
        }
        if (tableAssignmentHistoryRepository.findFirstByTableIdAndEndedAtIsNullOrderByStartedAtDesc(table.getId()).isPresent()) {
            throw new IllegalStateException("Table already has an active assignment history.");
        }

        table.assignWaiting(waiting);
        tableRepository.save(table);

        TableAssignmentHistory history = TableAssignmentHistory.builder()
                .event(waiting.getEvent())
                .table(table)
                .waiting(waiting)
                .startedAt(LocalDateTime.now())
                .build();
        tableAssignmentHistoryRepository.save(history);

        if (waiting.getStatus() != WaitingStatus.ARRIVED) {
            waiting.arrive();
            waitingRepository.save(waiting);
        }

        return buildWaitingResponse(waiting);
    }

    private Event getDefaultEvent() {
        return eventRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Default event not found."));
    }

    private Long generateWaitingNumber(Long eventId, LocalDate businessDate) {
        return waitingRepository.findMaxWaitingNumberByEventAndBusinessDate(eventId, businessDate) + 1L;
    }

    private WaitingResponse buildWaitingResponse(Waiting waiting) {
        Long rank = 0L;
        Integer estimatedMinutes = 0;

        if (waiting.getStatus() == WaitingStatus.WAITING) {
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

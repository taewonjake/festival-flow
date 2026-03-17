package com.example.backend.integration;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.Table;
import com.example.backend.domain.entity.TableAssignmentHistory;
import com.example.backend.domain.entity.User;
import com.example.backend.domain.entity.Waiting;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.domain.enums.UserRole;
import com.example.backend.domain.enums.UserStatus;
import com.example.backend.domain.enums.WaitingStatus;
import com.example.backend.dto.request.TableStatusUpdateRequest;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TableAssignmentHistoryRepository;
import com.example.backend.repository.TableRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WaitingRepository;
import com.example.backend.service.TableService;
import com.example.backend.service.WaitingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class WaitingAndTableConstraintIntegrationTest {

    @Autowired
    private WaitingService waitingService;

    @Autowired
    private TableService tableService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WaitingRepository waitingRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private TableAssignmentHistoryRepository tableAssignmentHistoryRepository;

    @Test
    void emptyToOccupied_createsOneAssignmentHistory() {
        Event event = getDefaultEvent();
        User user = createUser("010-1000-0001");
        Waiting waiting = createWaiting(event, user, 1L, WaitingStatus.CALLED, LocalDate.now());
        Table table = createTable(event, 101);

        waitingService.assignTable(waiting.getId(), table.getId());

        Table updatedTable = tableRepository.findById(table.getId()).orElseThrow();
        assertThat(updatedTable.getStatus()).isEqualTo(TableStatus.OCCUPIED);
        assertThat(updatedTable.getCurrentWaiting()).isNotNull();
        assertThat(updatedTable.getCurrentWaiting().getId()).isEqualTo(waiting.getId());

        TableAssignmentHistory activeHistory = tableAssignmentHistoryRepository
                .findFirstByTableIdAndEndedAtIsNullOrderByStartedAtDesc(table.getId())
                .orElseThrow();

        assertThat(activeHistory.getEvent().getId()).isEqualTo(event.getId());
        assertThat(activeHistory.getWaiting().getId()).isEqualTo(waiting.getId());
        assertThat(activeHistory.getStartedAt()).isNotNull();
        assertThat(activeHistory.getEndedAt()).isNull();
    }

    @Test
    void occupiedToCleaning_setsEndedAt() {
        Event event = getDefaultEvent();
        User user = createUser("010-1000-0002");
        Waiting waiting = createWaiting(event, user, 2L, WaitingStatus.CALLED, LocalDate.now());
        Table table = createTable(event, 102);

        waitingService.assignTable(waiting.getId(), table.getId());

        TableStatusUpdateRequest request = new TableStatusUpdateRequest();
        ReflectionTestUtils.setField(request, "status", TableStatus.CLEANING);

        tableService.updateStatus(table.getId(), request);

        Table updatedTable = tableRepository.findById(table.getId()).orElseThrow();
        assertThat(updatedTable.getStatus()).isEqualTo(TableStatus.CLEANING);
        assertThat(updatedTable.getCurrentWaiting()).isNull();

        assertThat(tableAssignmentHistoryRepository
                .findFirstByTableIdAndEndedAtIsNullOrderByStartedAtDesc(table.getId())).isEmpty();

        List<TableAssignmentHistory> histories = tableAssignmentHistoryRepository.findAll();
        assertThat(histories).hasSize(1);
        assertThat(histories.get(0).getEndedAt()).isNotNull();
    }

    @Test
    void duplicateActiveAssignmentHistory_sameTable_fails() {
        Event event = getDefaultEvent();
        User user1 = createUser("010-1000-0003");
        User user2 = createUser("010-1000-0004");
        Waiting waiting1 = createWaiting(event, user1, 3L, WaitingStatus.ARRIVED, LocalDate.now());
        Waiting waiting2 = createWaiting(event, user2, 4L, WaitingStatus.ARRIVED, LocalDate.now());
        Table table = createTable(event, 103);

        TableAssignmentHistory first = TableAssignmentHistory.builder()
                .event(event)
                .table(table)
                .waiting(waiting1)
                .startedAt(java.time.LocalDateTime.now())
                .build();
        tableAssignmentHistoryRepository.saveAndFlush(first);

        TableAssignmentHistory second = TableAssignmentHistory.builder()
                .event(event)
                .table(table)
                .waiting(waiting2)
                .startedAt(java.time.LocalDateTime.now().plusSeconds(1))
                .build();

        assertThatThrownBy(() -> tableAssignmentHistoryRepository.saveAndFlush(second))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void duplicateActiveWaiting_sameUser_fails() {
        Event event = getDefaultEvent();
        User user = createUser("010-1000-0005");
        LocalDate businessDate = LocalDate.now();

        Waiting first = createWaiting(event, user, 5L, WaitingStatus.WAITING, businessDate);

        Waiting second = Waiting.builder()
                .event(event)
                .user(user)
                .businessDate(businessDate)
                .headCount(2)
                .status(WaitingStatus.CALLED)
                .waitingNumber(6L)
                .build();

        assertThat(first.getId()).isNotNull();
        assertThatThrownBy(() -> waitingRepository.saveAndFlush(second))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void duplicateWaitingNumber_sameEventAndBusinessDate_fails() {
        Event event = getDefaultEvent();
        User user1 = createUser("010-1000-0006");
        User user2 = createUser("010-1000-0007");
        LocalDate businessDate = LocalDate.now();

        createWaiting(event, user1, 7L, WaitingStatus.WAITING, businessDate);

        Waiting duplicate = Waiting.builder()
                .event(event)
                .user(user2)
                .businessDate(businessDate)
                .headCount(2)
                .status(WaitingStatus.CANCELED)
                .waitingNumber(7L)
                .build();

        assertThatThrownBy(() -> waitingRepository.saveAndFlush(duplicate))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Event getDefaultEvent() {
        return eventRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> eventRepository.save(Event.builder()
                        .name("Test Event")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now().plusDays(1))
                        .status("ACTIVE")
                        .build()));
    }

    private User createUser(String phoneNumber) {
        return userRepository.save(User.builder()
                .kakaoId(null)
                .name("test-user-" + phoneNumber)
                .nickname("nick-" + phoneNumber)
                .phoneNumber(phoneNumber)
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .build());
    }

    private Waiting createWaiting(Event event, User user, Long waitingNumber, WaitingStatus status, LocalDate businessDate) {
        return waitingRepository.save(Waiting.builder()
                .event(event)
                .user(user)
                .businessDate(businessDate)
                .headCount(2)
                .status(status)
                .waitingNumber(waitingNumber)
                .build());
    }

    private Table createTable(Event event, int tableNumber) {
        return tableRepository.save(Table.builder()
                .event(event)
                .tableNumber(tableNumber)
                .capacity(4)
                .status(TableStatus.EMPTY)
                .build());
    }
}

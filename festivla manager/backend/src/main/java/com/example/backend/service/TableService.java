package com.example.backend.service;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.Table;
import com.example.backend.domain.entity.TableAssignmentHistory;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.dto.request.TableStatusUpdateRequest;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TableAssignmentHistoryRepository;
import com.example.backend.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableService {

    private final TableRepository tableRepository;
    private final EventRepository eventRepository;
    private final TableAssignmentHistoryRepository tableAssignmentHistoryRepository;

    public List<TableResponse> getAllTables() {
        Long eventId = getDefaultEvent().getId();
        List<Table> tables = tableRepository.findByEventIdOrderByTableNumberAsc(eventId);
        return tables.stream()
                .map(this::buildTableResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TableResponse updateStatus(Long tableId, TableStatusUpdateRequest request) {
        Long eventId = getDefaultEvent().getId();
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Table not found."));

        if (!table.getEvent().getId().equals(eventId)) {
            throw new IllegalStateException("Table does not belong to current event.");
        }

        TableStatus targetStatus = request.getStatus();
        TableStatus beforeStatus = table.getStatus();
        validateTransition(beforeStatus, targetStatus);

        if (beforeStatus == TableStatus.OCCUPIED && targetStatus != TableStatus.OCCUPIED) {
            closeActiveAssignment(table.getId());
            table.releaseWaiting();
        }

        if (targetStatus == TableStatus.EMPTY) {
            table.clearWaiting();
        } else if (targetStatus == TableStatus.CLEANING) {
            table.startCleaning();
        } else {
            table.updateStatus(targetStatus);
        }

        tableRepository.save(table);
        return buildTableResponse(table);
    }

    private void validateTransition(TableStatus beforeStatus, TableStatus targetStatus) {
        if (beforeStatus == targetStatus) {
            return;
        }

        if (targetStatus == TableStatus.OCCUPIED) {
            throw new IllegalStateException("Use assignTable API to move table to OCCUPIED.");
        }

        boolean allowed = switch (beforeStatus) {
            case EMPTY -> false;
            case OCCUPIED -> targetStatus == TableStatus.CLEANING || targetStatus == TableStatus.EMPTY;
            case CLEANING -> targetStatus == TableStatus.EMPTY;
        };

        if (!allowed) {
            throw new IllegalStateException("Invalid table status transition: " + beforeStatus + " -> " + targetStatus);
        }
    }

    private void closeActiveAssignment(Long tableId) {
        TableAssignmentHistory history = tableAssignmentHistoryRepository
                .findFirstByTableIdAndEndedAtIsNullOrderByStartedAtDesc(tableId)
                .orElseThrow(() -> new IllegalStateException("Active assignment history not found for OCCUPIED table."));
        history.end(LocalDateTime.now());
        tableAssignmentHistoryRepository.save(history);
    }

    private Event getDefaultEvent() {
        return eventRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Default event not found."));
    }

    private TableResponse buildTableResponse(Table table) {
        return TableResponse.builder()
                .tableId(table.getId())
                .tableNumber(table.getTableNumber())
                .capacity(table.getCapacity())
                .status(table.getStatus())
                .currentWaitingId(table.getCurrentWaiting() != null ? table.getCurrentWaiting().getId() : null)
                .build();
    }
}

package com.example.backend.service;

import com.example.backend.domain.entity.Table;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.dto.request.TableStatusUpdateRequest;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableService {

    private final TableRepository tableRepository;

    /**
     * 전체 테이블 조회
     */
    public List<TableResponse> getAllTables() {
        List<Table> tables = tableRepository.findAll();
        return tables.stream()
                .map(this::buildTableResponse)
                .collect(Collectors.toList());
    }

    /**
     * 테이블 상태 변경
     */
    @Transactional
    public TableResponse updateStatus(Long tableId, TableStatusUpdateRequest request) {
        Table table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("테이블을 찾을 수 없습니다."));

        table.updateStatus(request.getStatus());
        tableRepository.save(table);

        return buildTableResponse(table);
    }

    /**
     * TableResponse 생성
     */
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

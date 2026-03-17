package com.example.backend.config;

import com.example.backend.domain.entity.Event;
import com.example.backend.domain.entity.Table;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class TableInitializer implements CommandLineRunner {

    private final TableRepository tableRepository;
    private final EventRepository eventRepository;

    @Override
    public void run(String... args) {
        Event event = eventRepository.findFirstByOrderByIdAsc()
                .orElse(null);
        if (event == null) {
            return;
        }

        if (tableRepository.countByEventId(event.getId()) > 0) {
            log.info("Tables already exist for default event.");
            return;
        }

        for (int i = 1; i <= 8; i++) {
            Table table = Table.builder()
                    .event(event)
                    .tableNumber(i)
                    .capacity(4)
                    .status(TableStatus.EMPTY)
                    .build();
            tableRepository.save(table);
        }

        for (int i = 9; i <= 10; i++) {
            Table table = Table.builder()
                    .event(event)
                    .tableNumber(i)
                    .capacity(6)
                    .status(TableStatus.EMPTY)
                    .build();
            tableRepository.save(table);
        }

        log.info("Default event tables created.");
    }
}

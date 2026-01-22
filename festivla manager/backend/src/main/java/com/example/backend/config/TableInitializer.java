package com.example.backend.config;

import com.example.backend.domain.entity.Table;
import com.example.backend.domain.enums.TableStatus;
import com.example.backend.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TableInitializer implements CommandLineRunner {

    private final TableRepository tableRepository;

    @Override
    public void run(String... args) {
        // 이미 테이블이 있으면 초기화하지 않음
        if (tableRepository.count() > 0) {
            log.info("테이블이 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        log.info("테이블 초기 데이터 생성 시작...");

        // 1~8번: 4인석
        for (int i = 1; i <= 8; i++) {
            Table table = Table.builder()
                    .tableNumber(i)
                    .capacity(4)
                    .status(TableStatus.EMPTY)
                    .build();
            tableRepository.save(table);
            log.info("테이블 생성: 번호={}, 수용인원=4인석", i);
        }

        // 9~10번: 6인석
        for (int i = 9; i <= 10; i++) {
            Table table = Table.builder()
                    .tableNumber(i)
                    .capacity(6)
                    .status(TableStatus.EMPTY)
                    .build();
            tableRepository.save(table);
            log.info("테이블 생성: 번호={}, 수용인원=6인석", i);
        }

        log.info("테이블 초기 데이터 생성 완료 (총 {}개)", tableRepository.count());
    }
}

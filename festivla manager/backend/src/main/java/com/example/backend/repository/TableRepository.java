package com.example.backend.repository;

import com.example.backend.domain.entity.Table;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<Table, Long> {

    Optional<Table> findByTableNumber(Integer tableNumber);

    boolean existsByTableNumber(Integer tableNumber);

    // 상태별 테이블 수 조회
    Long countByStatus(com.example.backend.domain.enums.TableStatus status);
}

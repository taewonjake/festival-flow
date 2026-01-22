package com.example.backend.repository;

import com.example.backend.domain.entity.ChatRoom;
import com.example.backend.domain.enums.ChatRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 사용자의 채팅방 목록 조회
    List<ChatRoom> findByUserIdOrderByUpdatedAtDesc(Long userId);

    // 사용자의 열린 채팅방 조회
    Optional<ChatRoom> findByUserIdAndStatus(Long userId, ChatRoomStatus status);

    // 상태별 채팅방 목록 조회 (관리자용)
    List<ChatRoom> findByStatusOrderByUpdatedAtDesc(ChatRoomStatus status);
}

package com.example.backend.repository;

import com.example.backend.domain.entity.ChatRoom;
import com.example.backend.domain.enums.ChatRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByEventIdAndUserIdOrderByUpdatedAtDesc(Long eventId, Long userId);

    Optional<ChatRoom> findByEventIdAndUserIdAndStatus(Long eventId, Long userId, ChatRoomStatus status);

    List<ChatRoom> findByEventIdAndStatusOrderByUpdatedAtDesc(Long eventId, ChatRoomStatus status);

    List<ChatRoom> findByEventIdOrderByUpdatedAtDesc(Long eventId);
}

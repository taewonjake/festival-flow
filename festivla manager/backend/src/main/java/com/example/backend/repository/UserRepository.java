package com.example.backend.repository;

import com.example.backend.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByNickname(String nickname);

    Optional<User> findByKakaoId(String kakaoId);

    Optional<User> findByPhoneNumber(String phoneNumber);

    boolean existsByNickname(String nickname);

    boolean existsByPhoneNumber(String phoneNumber);
}

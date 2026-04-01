package com.example.backend.config;

import com.example.backend.domain.entity.Event;
import com.example.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component("cacheKey")
@RequiredArgsConstructor
public class CacheKeyHelper {

    private final EventRepository eventRepository;

    public String dashboard() {
        return "event:" + getDefaultEventId() + ":dashboard";
    }

    public String tables() {
        return "event:" + getDefaultEventId() + ":tables";
    }

    public String waitings(Object status) {
        String statusToken = status == null ? "ALL" : status.toString();
        return "event:" + getDefaultEventId() + ":waitings:" + statusToken;
    }

    private Long getDefaultEventId() {
        Event event = eventRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Default event not found."));
        return event.getId();
    }
}

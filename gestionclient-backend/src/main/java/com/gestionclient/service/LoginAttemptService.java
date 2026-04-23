package com.gestionclient.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 60_000L;

    private final Map<String, List<Long>> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String ip) {
        long now = System.currentTimeMillis();
        List<Long> times = attempts.getOrDefault(ip, List.of());
        return times.stream().filter(t -> now - t < WINDOW_MS).count() >= MAX_ATTEMPTS;
    }

    public void registerFailedAttempt(String ip) {
        long now = System.currentTimeMillis();
        attempts.compute(ip, (k, v) -> {
            List<Long> times = v == null ? new ArrayList<>() : new ArrayList<>(v);
            times.add(now);
            // Purge des entrées expirées pour éviter la fuite mémoire
            times.removeIf(t -> now - t >= WINDOW_MS);
            return times;
        });
    }
}

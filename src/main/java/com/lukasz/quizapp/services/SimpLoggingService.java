package com.lukasz.quizapp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SimpLoggingService {

    private SimpUserRegistry simpUserRegistry;
    private static final Logger logger = LoggerFactory.getLogger(SimpLoggingService.class);

    @Autowired
    public SimpLoggingService(SimpUserRegistry simpUserRegistry) {
        this.simpUserRegistry = simpUserRegistry;
    }

    public int getNumberOfSessions() {
        return simpUserRegistry.getUserCount();
    }

    @Scheduled(fixedRate = 5000, initialDelay = 10000)
    public void logNumberOfSessions() {
        logger.info(String.format("Number of simp sessions: %d", getNumberOfSessions()));
    }
}

package com.lukasz.quizapp.dto.game;

import com.lukasz.quizapp.entities.Assignment;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.SubmittedAnswer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
@AllArgsConstructor
public class Game {

    private String gameCode;

    private String hostUsername;

    private Quiz quiz;

    private Long assignmentId;

    private int currentQuestion;

    private Long currentQuestionStartedAt;

    private Map<String, GameStats> gameStatsMap;

    private List<String> answeredCurrentQuestion;

    private boolean started;

    public Game(String gameCode, String hostUsername, Quiz quiz, Long assignmentId) {
        this.gameCode = gameCode;
        this.hostUsername = hostUsername;
        this.quiz = quiz;
        this.assignmentId = assignmentId;
        this.currentQuestion = 0;
        this.gameStatsMap = new ConcurrentHashMap<>();
        this.answeredCurrentQuestion = new ArrayList<>();
        this.started = false;
    }
}

package com.lukasz.quizapp.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lukasz.quizapp.dto.game.Game;
import com.lukasz.quizapp.dto.game.GameEvent;
import com.lukasz.quizapp.dto.game.GameEventType;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.repositories.QuizRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.sql.SQLOutput;
import java.util.*;
import java.util.concurrent.*;

@Service
public class GameService {
    private static char[] chars = "0123456789abcdefghijklmnopqrstuvwxyz".toCharArray();

    private static final int GAME_CODE_LENGTH = 6;

    private static final int ANSWER_TOPIC_CODE_LENGTH = 36;

    private static final int DELAY_BETWEEN_QUESTIONS = 10;

    private SimpMessagingTemplate template;

    private ObjectMapper objectMapper;

    private static final Map<String, Game> games = new ConcurrentHashMap<>();

    private static final Map<String, String> answerTopics = new ConcurrentHashMap<>();

    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(Runtime.getRuntime().availableProcessors());

    private final QuizRepository quizRepository;

    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    private final SolveService solveService;

    private final UserService userService;

    private final AssignmentService assignmentService;

    @Autowired
    public GameService(SimpMessagingTemplate simpMessagingTemplate, ObjectMapper objectMapper, QuizRepository quizRepository, SolveService solveService, UserService userService, AssignmentService assignmentService) {
        this.template = simpMessagingTemplate;
        this.objectMapper = objectMapper;
        this.quizRepository = quizRepository;
        this.solveService = solveService;
        this.userService = userService;
        this.assignmentService = assignmentService;
    }

    public Game getHostedGame(String username) {
        Optional<Map.Entry<String, Game>> game = games.entrySet()
                .stream()
                .filter(gameEntry -> gameEntry.getValue().getHostUsername().equals(username))
                .findFirst();

        if (game.isEmpty()) return null;

        return game.get().getValue();
    }

    public Game getCurrentGame(String username) {
        Optional<Map.Entry<String, Game>> game = games.entrySet()
                .stream()
                .filter(gameEntry -> gameEntry.getValue().getScores().containsKey(username))
                .findFirst();

        if (game.isEmpty()) return null;

        return game.get().getValue();
    }

    public Game createGame(String username, Long quizId, Long assignmentId) {
        Optional<Quiz> quiz = quizRepository.findById(quizId);

        if(assignmentId != null && !assignmentService.exists(assignmentId)) {
            return null;
        }

        if (quiz.isEmpty()) {
            return null;
        }

        String gameCode = generateGameCode();

        Game game = new Game(gameCode, username, generateAnswerTopicCode() ,quiz.get(), assignmentId);
        games.put(gameCode, game);

        return game;
    }

    private String generateGameCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        do {
            sb.setLength(0);
            for (int i = 0; i < GAME_CODE_LENGTH; i++) {
                sb.append(chars[random.nextInt(chars.length)]);
            }
        } while (games.containsKey(sb.toString()));

        return sb.toString();
    }

    private String generateAnswerTopicCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        do {
            sb.setLength(0);
            for (int i = 0; i < GAME_CODE_LENGTH; i++) {
                sb.append(chars[random.nextInt(chars.length)]);
            }
        } while (games.containsKey(sb.toString()));

        return sb.toString();
    }

    public Long addPlayerToGame(String username, String gameCode, String sessionId) {
        Game game = games.get(gameCode);

        if (game == null) {
            return -1L;
        }

        return game.getScores().putIfAbsent(username, 0L);
    }

    public void nextQuestion(String gameCode) {
        Game game = games.get(gameCode);

        if (game == null) {
            return;
        }

        if (game.isStarted()) {
            return;
        }

        game.setStarted(true);

        Future<?> future = scheduler.scheduleAtFixedRate(new SendUpdatesToTopicTask(game, template, objectMapper), 0, 2, TimeUnit.SECONDS);
        scheduler.schedule(new NextQuestionTask(game, template, objectMapper, future), 0, TimeUnit.SECONDS);
    }

    public boolean submitAnswer(String gameCode, String username, Long answerId) {
        Game game = games.get(gameCode);

        synchronized (game) {
            if (game.getQuiz() == null || game.getQuiz().getQuestions() == null || game.getAnsweredCurrentQuestion() == null) return false;

            if (game.getAnsweredCurrentQuestion().stream().anyMatch(u -> u.equals(username))) {
                return false;
            }

            game.getAnsweredCurrentQuestion().add(username);
            int currentQuestionIdx = game.getCurrentQuestion() - 1;

            if (currentQuestionIdx < 0 || currentQuestionIdx >= game.getQuiz().getQuestions().size()) {
                return false;
            }

            Question currentQuestion = game.getQuiz().getQuestions().get(currentQuestionIdx);

            Optional<Answer> validAnswer = currentQuestion
                    .getAnswers()
                    .stream()
                    .filter(answer -> answer.getIsValid())
                    .findFirst();

            if (validAnswer.isPresent() && answerId.equals(validAnswer.get().getId()) && game.getCurrentQuestionStartedAt() != null) {
                game.getScores().computeIfPresent(username, (k, v) -> v + calculatePointsScored(currentQuestion.getTimeToAnswer() >= 0 ? currentQuestion.getTimeToAnswer() : 10, game.getCurrentQuestionStartedAt()));
                return true;
            }
        }

        return false;
    }

    private long calculatePointsScored(Integer timeToAnswer, Long questionStartedTime) {
        int base = 10_000;
        long negativePointUnits = (System.currentTimeMillis() - questionStartedTime) / 500;
        // half a sec "bonus" for delay
        if(negativePointUnits > 0) negativePointUnits--;
        long pointsScored = base - (base / (timeToAnswer * 2)) * negativePointUnits;

        logger.debug(String.format("calculatePointsScored, timeToAnswer: %d, questionStartedTime: %d, negativePointUnits: %d, pointsScored: %d", timeToAnswer, questionStartedTime, negativePointUnits, pointsScored));

        return pointsScored;
    }

    private void saveScores(Game game) {
        List<Solve> scores = new ArrayList<>();
        Assignment assignment;

        if(assignmentService.exists(game.getAssignmentId())) {
            assignment = assignmentService.read(game.getAssignmentId());
        } else {
            assignment = null;
        }

        game.getScores().entrySet()
                .forEach((element) -> {
                    Solve solve = new Solve(null, game.getQuiz(), assignment, userService.read(element.getKey()), element.getValue().intValue(), game.getQuiz().getQuestions().size() * 10000, null, true);
                    scores.add(solve);
                });

        List<Solve> savedScores = solveService.save(scores);

        if(assignment != null) {
            for(Solve solve: savedScores) {
                assignment.getSolves().add(solve);
            }

            assignmentService.save(assignment);
        }
    }

    private record SendUpdatesToTopicTask(Game game, SimpMessagingTemplate template, ObjectMapper objectMapper) implements Runnable {
        @Override
        public void run() {
            try {
                template.convertAndSend(String.format("/topic/%s", game.getGameCode()), new GameEvent(GameEventType.SCORES_UPDATE, null, objectMapper.writeValueAsString(game.getScores())));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private class NextQuestionTask implements Runnable {
        private final Game game;
        private final SimpMessagingTemplate template;
        private final ObjectMapper objectMapper;
        private final Future<?> future;

        public NextQuestionTask(Game game, SimpMessagingTemplate simpMessagingTemplate, ObjectMapper objectMapper, Future<?> future) {
            this.game = game;
            this.template = simpMessagingTemplate;
            this.objectMapper = objectMapper;
            this.future = future;
        }
        @Override
        public void run() {
            synchronized (game) {
                try {
                    int currentQuestion = game.getCurrentQuestion();

                    if (game.getCurrentQuestion() >= game.getQuiz().getQuestions().size()) {
                        future.cancel(true);
                        games.remove(game.getGameCode());
                        template.convertAndSend(String.format("/topic/%s", game.getGameCode()), new GameEvent(GameEventType.END_GAME, null, objectMapper.writeValueAsString(game.getScores())));
                        saveScores(game);
                        return;
                    }

                    int cooldown = game.getQuiz().getQuestions().get(currentQuestion).getTimeToAnswer();

                    if (cooldown <= 0) {
                        cooldown = 10;
                    }

                    Question question = game.getQuiz().getQuestions().get(game.getCurrentQuestion());
                    question.setTimeToAnswer(cooldown);

                    if(game.getAnswerTopic() != null) {
                        logger.debug(String.format("Sending answer to host on topic /user/%s/queue/reply", game.getAnswerTopic()));
                        Optional<Answer> validAnswer = question.getAnswers().stream().filter(Answer::getIsValid).findFirst();
                        validAnswer.ifPresent(answer -> template.convertAndSendToUser(game.getAnswerTopic(), "/queue/reply", new GameEvent(GameEventType.ANSWER, null, answer.getContent()), createSpecificUserHeaders(game.getAnswerTopic())));
                    } else {
                        logger.debug("Answer topic was null when tried to send answer to host");
                    }
                    game.setCurrentQuestionStartedAt(System.currentTimeMillis());
                    template.convertAndSend(String.format("/topic/%s", game.getGameCode()), new GameEvent(GameEventType.NEW_QUESTION, null, objectMapper.writeValueAsString(question)));

                    game.setCurrentQuestion(game.getCurrentQuestion() + 1);
                    game.setAnsweredCurrentQuestion(new ArrayList<>());
                    scheduler.schedule(new NextQuestionTask(game, template, objectMapper, future), cooldown + DELAY_BETWEEN_QUESTIONS, TimeUnit.SECONDS);

                    logger.debug("Next question sent");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        private static MessageHeaders createSpecificUserHeaders(String sessionId) {
            SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);

            accessor.setSessionId(sessionId);
            accessor.setLeaveMutable(true);

            return accessor.getMessageHeaders();
        }
    }
}

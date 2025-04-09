package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.game.Game;
import com.lukasz.quizapp.dto.game.GameEvent;
import com.lukasz.quizapp.dto.game.GameEventType;
import com.lukasz.quizapp.dto.game.GameStats;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.services.AuthService;
import com.lukasz.quizapp.services.GameService;
import com.lukasz.quizapp.services.QuizService;
import jakarta.websocket.server.PathParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;

@Controller
public class GameController {
    private SimpMessageSendingOperations simpMessageSendingOperations;
    private final GameService gameService;
    private final QuizService quizService;
    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    public GameController(SimpMessageSendingOperations simpMessageSendingOperations, GameService gameService, QuizService quizService, AuthService authService) {
        this.simpMessageSendingOperations = simpMessageSendingOperations;
        this.gameService = gameService;
        this.quizService = quizService;
        this.authService = authService;
    }

    @GetMapping
    @RequestMapping("/api/game/create/{quizId}")
    public ResponseEntity<Game> createGame(@PathVariable Long quizId, @RequestParam(required = false) Long assignmentId) {
        User user = authService.getAuthenticatedUser();

        if(quizId == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(gameService.createGame(user.getUsername(), quizId, assignmentId));
    }

    @GetMapping
    @RequestMapping("/api/game/currentGame")
    public ResponseEntity<Game> currentGame() {
        User user = authService.getAuthenticatedUser();

        return ResponseEntity.ok(gameService.getCurrentGame(user.getUsername()));
    }

    @GetMapping
    @RequestMapping("/api/game/hostedGame")
    public ResponseEntity<Game> hostedGame() {
        User user = authService.getAuthenticatedUser();

        return ResponseEntity.ok(gameService.getHostedGame(user.getUsername()));
    }

    @MessageMapping("/game/{gameId}")
    @SendTo("/topic/{gameId}")
    public GameEvent sendMessageToGame(@DestinationVariable String gameId, @Payload GameEvent gameMessage, @Header("simpSessionId") String sessionId, Principal principal) {
        String username = principal.getName();

        if(username == null) {
            return new GameEvent(GameEventType.ERROR, null);
        }

        logger.debug(String.format("GAME ID: %s, Processing %s game event", gameId, gameMessage.getEventType()));

        switch (gameMessage.getEventType()) {
            case PLAYER_JOINED_GAME -> {
                GameStats result = gameService.addPlayerToGame(username, gameId, sessionId);

                if(result == null) {
                    return new GameEvent(GameEventType.PLAYER_JOINED_GAME, username);
                } else {
                    return new GameEvent(GameEventType.PLAYER_RECONNECTED, username);
                }
            }
            case START_GAME -> {
                Game game = gameService.getHostedGame(username);

                if(game == null) {
                    return new GameEvent(GameEventType.ERROR, username, "You are not hosting any game.");
                }

                gameService.nextQuestion(game.getGameCode());
            }
            case ANSWER -> {
                Long answerId = Long.parseLong(gameMessage.getMessage());
                gameService.submitAnswer(gameId, username, answerId);
            }
        }

        return null;
    }
}

package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.QuizSearch;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.services.AuthService;
import com.lukasz.quizapp.services.QuizService;
import com.lukasz.quizapp.services.SolveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    private final QuizService quizService;

    private final SolveService solveService;

    private final AuthService authService;

    @Autowired
    public QuizController(QuizService quizService, SolveService solveService, AuthService authService) {
        this.quizService = quizService;
        this.solveService = solveService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<Quiz> addQuiz(@Valid @RequestPart("quiz") QuizDto quizDto, @RequestPart(value = "images") MultipartFile[] images) {
        return ResponseEntity.ok(quizService.save(quizDto, images));
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes(@RequestParam(required = false) String title) {
        QuizSearch quizSearch = new QuizSearch(title);
        List<Quiz> quizzes = quizService.read(quizSearch);
        quizService.nullifyIsValid(quizzes);

        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long id) {
        Quiz quiz = quizService.read(id);
        quizService.nullifyIsValid(quiz);

        return ResponseEntity.ok(quiz);
    }

    @PostMapping
    @RequestMapping("/solve/{id}")
    public ResponseEntity<Solve> submitSolution(@PathVariable Long id, @RequestBody QuizDto quizDto) {
        User user = authService.getAuthenticatedUser();
        Quiz quiz = quizService.read(id);
        Integer correctAnswers = quizService.countCorrectAnswers(quiz, quizDto);
        Solve solve = new Solve(null, quiz, null, user, correctAnswers, quiz.getQuestions().size(), quizDto.getQuestions(), false);
        solveService.save(solve);

        return ResponseEntity.ok(solve);
    }
}

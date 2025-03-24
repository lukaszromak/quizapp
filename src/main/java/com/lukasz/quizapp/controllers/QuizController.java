package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.AnswerDto;
import com.lukasz.quizapp.dto.QuestionDto;
import com.lukasz.quizapp.dto.QuizSearch;
import com.lukasz.quizapp.entities.*;
import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.exception.AnswerNotFoundException;
import com.lukasz.quizapp.exception.QuestionNotFoundException;
import com.lukasz.quizapp.services.AuthService;
import com.lukasz.quizapp.services.QuizService;
import com.lukasz.quizapp.services.SolveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

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

        if(!authService.isModeratorOrAdmin()) {
            quizService.nullifyIsValid(quiz);
        }

        return ResponseEntity.ok(quiz);
    }

    @PostMapping
    @RequestMapping("/solve/{id}")
    public ResponseEntity<Solve> submitSolution(@PathVariable Long id, @RequestBody QuizDto quizDto) {
        User user = authService.getAuthenticatedUser();
        Quiz quiz = quizService.read(id);
        Integer correctAnswers = quizService.countCorrectAnswers(quiz, quizDto);

        List<SubmittedAnswer> submittedAnswers = new ArrayList<>();

        for(QuestionDto questionDto: quizDto.getQuestions()) {
            Question question = findQuestionById(quiz, questionDto.getId());

            if(question == null) {
                throw new QuestionNotFoundException(String.format("Quiz with id {%d} doesn't contain question with id {%d}", quiz.getId(), questionDto.getId()));
            }

            Answer answer = findSubmittedAnswer(question.getAnswers().stream().toList(), questionDto.getAnswers());

            submittedAnswers.add(
                    new SubmittedAnswer(
                            null,
                            null,
                            question,
                            answer
                    )
            );
        }

        Solve solve = new Solve(null, quiz, null, user, correctAnswers, quiz.getQuestions().size(), submittedAnswers, false, null);
        solveService.save(solve);

        return ResponseEntity.ok(solve);
    }

    private Question findQuestionById(Quiz quiz, Long id) {
        for(Question question : quiz.getQuestions()) {
            if(Objects.equals(question.getId(), id)) return question;
        }

        return null;
    }

    private Answer findSubmittedAnswer(List<Answer> answers, List<AnswerDto> submittedAnswers) {
        Long submittedAnswerId = null;

        for(AnswerDto answerDto : submittedAnswers) {
            if(answerDto.getIsValid()) {
                submittedAnswerId = answerDto.getId();
            }
        }

        if(submittedAnswerId == null) return null;

        for(Answer answer : answers) {
            if(Objects.equals(answer.getId(), submittedAnswerId)) return answer;
        }

        throw new AnswerNotFoundException("Question doesn't contain selected answer.");
    }
}

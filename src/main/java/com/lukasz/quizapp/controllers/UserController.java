package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.dto.SolveDto;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.services.AuthService;
import com.lukasz.quizapp.services.QuizService;
import com.lukasz.quizapp.services.SolveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {
    private QuizService quizService;
    private AuthService authService;
    private SolveService solveService;

    @Autowired
    public UserController(QuizService quizService, AuthService authService, SolveService solveService) {
        this.quizService = quizService;
        this.authService = authService;
        this.solveService = solveService;
    }

    @GetMapping("/quizzes")
    public List<Quiz> getQuizzes() {
        return quizService.read(authService.getAuthenticatedUser());
    }

    @GetMapping("/{userId}/solves")
    public List<SolveDto> getSolves(@PathVariable Long userId) {
        List<Solve> solves = solveService.read(userId);

        return mapSolveToSolveDto(solves);
    }

    private List<SolveDto> mapSolveToSolveDto(List<Solve> solves) {
        return solves.stream().map((solve -> new SolveDto(solve.getId(), mapQuizToQuizDto(solve.getQuiz()), solve.getId(), solve.getCorrectAnswers(), solve.getTotalAnswers(), solve.isWasGame()))).toList();
    }

    private QuizDto mapQuizToQuizDto(Quiz quiz) {
        QuizDto quizDto = new QuizDto();
        quizDto.setTitle(quiz.getTitle());
        quizDto.setQuestions(new ArrayList<>());
        quizDto.setCategories(quiz.getCategories());

        return quizDto;
    }
}

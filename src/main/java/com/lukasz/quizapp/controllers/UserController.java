package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.PathDto;
import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.dto.SolveDto;
import com.lukasz.quizapp.dto.doExistResponse;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.lukasz.quizapp.services.PathService.mapPathsListToPathDtoList;

@RestController
@RequestMapping("/user")
public class UserController {
    private QuizService quizService;
    private AuthService authService;
    private SolveService solveService;
    private PathService pathService;
    private UserService userService;

    @Autowired
    public UserController(QuizService quizService, AuthService authService, SolveService solveService, PathService pathService, UserService userService) {
        this.quizService = quizService;
        this.authService = authService;
        this.solveService = solveService;
        this.pathService = pathService;
        this.userService = userService;
    }

    @GetMapping("/quizzes")
    public List<Quiz> getQuizzes() {
        return quizService.read(authService.getAuthenticatedUser());
    }

    @GetMapping("/paths")
    public List<PathDto> getPaths() {
        List<Path> pathList = pathService.read(authService.getAuthenticatedUser());

        return mapPathsListToPathDtoList(pathList);
    }

    @GetMapping("/{userId}/solves")
    public List<SolveDto> getSolves(@PathVariable Long userId) {
        List<Solve> solves = solveService.read(userId);

        return mapSolveToSolveDto(solves);
    }

    @GetMapping("/exists")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public doExistResponse doExist(@RequestParam String searchString) {
        if(userService.existsByUsername(searchString)) {
            User user = userService.read(searchString);

            return new doExistResponse(user.getId(), user.getUsername(), true);
        }

        if(userService.existsByEmail(searchString)) {
            User user = userService.readByEmail(searchString);

            return new doExistResponse(user.getId(), user.getUsername(), true);
        }

        Long possibleId = -1L;

        try {
            possibleId = Long.parseLong(searchString);
        } catch (NumberFormatException exception) {
            return new doExistResponse(null, null, false);
        }

       if(userService.existsById(possibleId)) {
           User user = userService.read(possibleId);

           return new doExistResponse(user.getId(), user.getUsername(), true);
       }

       return new doExistResponse(null, null, false);
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

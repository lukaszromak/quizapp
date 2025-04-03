package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.QuizDto;
import com.lukasz.quizapp.dto.SolveDto;
import com.lukasz.quizapp.dto.game.UserDto;
import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.repositories.SolveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class SolveService {

    private final SolveRepository solveRepository;
    private final AuthService authService;

    @Autowired
    public SolveService(SolveRepository solveRepository, AuthService authService) {
        this.solveRepository = solveRepository;
        this.authService = authService;
    }

    public Solve save(Solve solve) {
        return this.solveRepository.save(solve);
    }

    public List<Solve> save(List<Solve> solves) {
        return this.solveRepository.saveAll(solves);
    }

    public List<Solve> read() {
        User user = authService.getAuthenticatedUser();

        return this.solveRepository.findAllByUser(user);
    }

    public Solve read(Long solveId) {
        Optional<Solve> solveOptional = solveRepository.findById(solveId);

        if(solveOptional.isEmpty()) {
            throw new RuntimeException("Solve not found");
        }

        return solveOptional.get();
    }

    public static List<SolveDto> mapSolveListToSolveDtoList(List<Solve> solves) {
        if(solves == null) return null;

        return solves.stream().map(
                (solve -> new SolveDto(
                        solve.getId(),
                        new QuizDto(solve.getQuiz().getId(), solve.getQuiz().getTitle(), null, solve.getQuiz().getCategories()),
                        new UserDto(solve.getUser().getId(), solve.getUser().getUsername(), null, null),
                        solve.getCorrectAnswers(),
                        solve.getTotalAnswers(),
                        solve.getUserAnswers(),
                        solve.isWasGame(),
                        solve.getSubmittedAt())
                )).toList();
    }
}

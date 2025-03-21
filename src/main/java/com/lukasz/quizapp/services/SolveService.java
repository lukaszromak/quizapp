package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.SolveDto;
import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.exception.UnauthorizedException;
import com.lukasz.quizapp.repositories.SolveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

import static com.lukasz.quizapp.services.QuizService.mapQuizToQuizDto;

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

    public List<Solve> read(Long userId) {
        User user = authService.getAuthenticatedUser();

        System.out.println(userId);
        System.out.println(user.getId());

        if(!user.getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized");
        }

        return this.solveRepository.findAllByUser(user);
    }

    public static List<SolveDto> mapSolveListToSolveDtoList(List<Solve> solves) {
        return solves.stream().map((solve -> new SolveDto(solve.getId(), solve.getQuiz().getId(), solve.getId(), solve.getCorrectAnswers(), solve.getTotalAnswers(), solve.isWasGame()))).toList();
    }
}

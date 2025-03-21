package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.AssignmentDto;
import com.lukasz.quizapp.entities.Assignment;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.repositories.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.Optional;

import static com.lukasz.quizapp.services.SolveService.mapSolveListToSolveDtoList;

@Service
public class AssignmentService {

    private AssignmentRepository assignmentRepository;

    private PathService pathService;

    private QuizService quizService;

    private AuthService authService;

    @Autowired
    public AssignmentService(AssignmentRepository assignmentRepository, PathService pathService, QuizService quizService, AuthService authService) {
        this.assignmentRepository = assignmentRepository;
        this.pathService = pathService;
        this.quizService = quizService;
        this.authService = authService;
    }

    public Assignment read(Long id) {
        Optional<Assignment> assignmentOptional = assignmentRepository.findById(id);

        if(assignmentOptional.isEmpty()) {
            throw new RuntimeException(String.format("Assignment with id %d not found", id));
        }

        Assignment assignment = assignmentOptional.get();

        if(!authService.isModeratorOrAdmin()) {
            assignment.setSolves(null);
        }

        return assignment;
    }

    public boolean exists(Long id) {
        if(id == null) return false;

        Optional<Assignment> assignment = assignmentRepository.findById(id);

        return assignment.isPresent();
    }

    public AssignmentDto save(AssignmentDto assignmentDto) throws PathNotFoundException {
        if((assignmentDto.getStartDate() == null || assignmentDto.getExpirationDate() == null) || assignmentDto.getStartDate().after(assignmentDto.getExpirationDate())) {
            throw new RuntimeException("Assignment expires before it starts.");
        }

        Assignment assignment = new Assignment();
        assignment.setId(null);
        assignment.setName(assignmentDto.getName());

        Path path = pathService.read(assignmentDto.getPathId());
        assignment.setPath(path);

        Quiz quiz = quizService.read(assignmentDto.getQuizId());
        assignment.setQuiz(quiz);

        assignment.setSolves(null);

        assignment.setStartDate(assignmentDto.getStartDate());
        assignment.setExpirationDate(assignmentDto.getExpirationDate());
        assignment.setSynchronous(assignmentDto.isSynchronous());

        Assignment savedAssignment = assignmentRepository.save(assignment);

        return mapAssignmentToAssignmentDto(savedAssignment);
    }

    public Assignment save(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public static AssignmentDto mapAssignmentToAssignmentDto(Assignment assignment) {
        AssignmentDto assignmentDto = new AssignmentDto();

        assignmentDto.setId(assignment.getId());
        assignmentDto.setName(assignment.getName());
        assignmentDto.setPathId(assignment.getPath().getId());
        assignmentDto.setQuizId(assignment.getPath().getId());
        assignmentDto.setSolves(mapSolveListToSolveDtoList(assignment.getSolves()));
        assignmentDto.setExpirationDate(assignment.getExpirationDate());
        assignmentDto.setStartDate(assignment.getStartDate());
        assignmentDto.setSynchronous(assignment.isSynchronous());

        return assignmentDto;
    }

}

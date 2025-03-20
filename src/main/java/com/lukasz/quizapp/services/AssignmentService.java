package com.lukasz.quizapp.services;

import com.lukasz.quizapp.dto.AssignmentDto;
import com.lukasz.quizapp.entities.Assignment;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.repositories.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssignmentService {

    private AssignmentRepository assignmentRepository;

    private PathService pathService;

    private QuizService quizService;

    @Autowired
    public AssignmentService(AssignmentRepository assignmentRepository, PathService pathService, QuizService quizService) {
        this.assignmentRepository = assignmentRepository;
        this.pathService = pathService;
        this.quizService = quizService;
    }

    public AssignmentDto save(AssignmentDto assignmentDto) throws PathNotFoundException {
        if((assignmentDto.getStartDate() == null || assignmentDto.getExpirationDate() == null) || assignmentDto.getStartDate().after(assignmentDto.getExpirationDate())) {
            throw new RuntimeException("Assignment expires before it starts.");
        }

        Assignment assignment = new Assignment();
        assignment.setId(null);
        assignment.setName(assignment.getName());

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

    public static AssignmentDto mapAssignmentToAssignmentDto(Assignment assignment) {
        AssignmentDto assignmentDto = new AssignmentDto();

        assignmentDto.setId(assignment.getId());
        assignmentDto.setName(assignment.getName());
        assignmentDto.setPathId(assignment.getPath().getId());
        assignmentDto.setQuizId(assignment.getPath().getId());
        assignmentDto.setExpirationDate(assignment.getExpirationDate());
        assignmentDto.setStartDate(assignment.getStartDate());
        assignmentDto.setSynchronous(assignment.isSynchronous());

        return assignmentDto;
    }

}

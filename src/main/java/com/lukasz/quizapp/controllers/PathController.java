package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.PathDto;
import com.lukasz.quizapp.entities.Assignment;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.services.PathService;
import com.lukasz.quizapp.services.QuizService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/path")
public class PathController {

    private final PathService pathService;

    private final QuizService quizService;

    @Autowired
    public PathController(PathService pathService, QuizService quizService) {
        this.pathService = pathService;
        this.quizService = quizService;
    }

    @GetMapping("/{id}")
    public PathDto getPath(@PathVariable Long id) throws PathNotFoundException {
        return pathService.mapPathToPathDto(pathService.read(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public Path createPath(@RequestBody Path path) {
        Path savedPath = pathService.save(path);

        for(Quiz quiz : savedPath.getQuizzes())
        {
            quiz.setQuestions(null);
            quiz.setCategories(null);
            savedPath.setStudents(null);
        }

        return savedPath;
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @Transactional
    public PathDto updatePath(@RequestBody PathDto pathDto) {
        return pathService.mapPathToPathDto(pathService.update(pathDto));
    }

    @GetMapping("/{id}/quizzes")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<List<Quiz>> getQuizzes(@PathVariable Long id) throws PathNotFoundException {
        Path path = pathService.read(id);

        return ResponseEntity.ok(path.getQuizzes());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<String> deletePath(@PathVariable Long id) {
        pathService.delete(id);

        return ResponseEntity.ok(String.format("Path with id %d successfully deleted.", id));
    }

    @DeleteMapping("/{id}/students/{username}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id, @PathVariable String username) throws PathNotFoundException {
        Path path = pathService.read(id);
        path.setStudents(path.getStudents().stream().filter(user -> !user.getUsername().equals(username)).collect(Collectors.toList()));
        pathService.save(path);

        return ResponseEntity.ok(String.format("Student %s successfully removed from quiz path.", username));
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    public ResponseEntity<String> deleteAssignment(@PathVariable Long id, @PathVariable Long assignmentId) throws PathNotFoundException {
        Path path = pathService.read(id);
        path.setAssignments(path.getAssignments().stream().filter(assignment -> !Objects.equals(assignment.getId(), assignmentId)).collect(Collectors.toList()));
        pathService.save(path);

        return ResponseEntity.ok(String.format("Assignment with id %d successfully deleted", assignmentId));
    }

    @DeleteMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long id, @PathVariable Long quizId) throws PathNotFoundException {
        Path path = pathService.read(id);
        path.setQuizzes(path.getQuizzes().stream().filter(quiz -> !Objects.equals(quiz.getId(), quizId)).collect(Collectors.toList()));
        pathService.save(path);

        return ResponseEntity.ok(String.format("Quiz with id %d successfully deleted", quizId));
    }

    @PutMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<String> addQuiz(@PathVariable Long id, @PathVariable Long quizId) throws PathNotFoundException {
        Path path = pathService.read(id);
        Quiz quiz = quizService.read(id);
        path.getQuizzes().add(quiz);
        pathService.save(path);

        return ResponseEntity.ok("Quiz added");
    }
}

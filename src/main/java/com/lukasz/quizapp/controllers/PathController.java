package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.PathDto;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.services.PathService;
import com.lukasz.quizapp.services.QuizService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.lukasz.quizapp.services.PathService.mapPathToPathDto;

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
        return mapPathToPathDto(pathService.read(id));
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
        return mapPathToPathDto(pathService.update(pathDto));
    }

    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzes(@PathVariable Long id) throws PathNotFoundException {
        Path path = pathService.read(id);

        return ResponseEntity.ok(path.getQuizzes());
    }

}

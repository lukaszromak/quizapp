package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.PathDto;
import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.services.PathService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.lukasz.quizapp.services.PathService.mapPathToPathDto;

@RestController
@RequestMapping("/path")
public class PathController {

    private final PathService pathService;

    @Autowired
    public PathController(PathService pathService) {
        this.pathService = pathService;
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
    public Path updatePath(@RequestBody PathDto pathDto) {
        Path updatedPath = pathService.update(pathDto);

        for(Quiz quiz : updatedPath.getQuizzes())
        {
            quiz.setQuestions(null);
            quiz.setCategories(null);
            updatedPath.setStudents(null);
        }

        return updatedPath;
    }

}

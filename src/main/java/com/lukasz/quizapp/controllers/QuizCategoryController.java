package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.QuizCategory;
import com.lukasz.quizapp.repositories.QuizCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/quizCategory")
public class QuizCategoryController {

    private final QuizCategoryRepository quizCategoryRepository;

    @Autowired
    private QuizCategoryController(QuizCategoryRepository quizCategoryRepository) {
        this.quizCategoryRepository = quizCategoryRepository;
    }

    @GetMapping
    public List<QuizCategory> getQuizCategories() {
        return quizCategoryRepository.findAll();
    }
}

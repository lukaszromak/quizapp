package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.QuizCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizCategoryRepository extends JpaRepository<QuizCategory, Long> {
}

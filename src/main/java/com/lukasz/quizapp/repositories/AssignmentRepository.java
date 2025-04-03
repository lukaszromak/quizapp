package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Assignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    @EntityGraph(attributePaths = {"solves", "solves.user", "solves.quiz", "solves.quiz.categories", "solves.userAnswers"})
    Optional<Assignment> findById(Long id);
}

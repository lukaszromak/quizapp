package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolveRepository extends JpaRepository<Solve, Long> {
    @EntityGraph(attributePaths = {"quiz", "quiz.creator", "quiz.categories", "user"})
    List<Solve> findAll();

    @EntityGraph(attributePaths = {"quiz", "quiz.creator", "quiz.categories", "user", "userAnswers"})
    List<Solve> findAllByUser(User user);

    @EntityGraph(attributePaths = {"userAnswers"})
    Optional<Solve> findById(Long id);
}

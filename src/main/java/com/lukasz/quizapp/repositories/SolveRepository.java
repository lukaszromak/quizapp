package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolveRepository extends JpaRepository<Solve, Long> {
    @EntityGraph(attributePaths = {"quiz", "quiz.creator", "quiz.categories"})
    List<Solve> findAllByUser(User user);
}

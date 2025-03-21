package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends CrudRepository<Quiz, Long> {
    @EntityGraph(value = "quiz-entity-graph-questions-categories")
    List<Quiz> findAll(Example<Quiz> example);

    @EntityGraph(value = "quiz-entity-graph-questions-categories")
    List<Quiz> findAll();

    @EntityGraph(value = "quiz-entity-graph-questions-categories")
    Optional<Quiz> findById(Long id);

    @EntityGraph(value = "quiz-entity-graph-questions-categories")
    List<Quiz> findAllByCreator(User user);
}

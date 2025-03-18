package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PathRepository extends JpaRepository<Path, Long> {
    List<Path> findAllByTeacher(User user);
    @EntityGraph(attributePaths = {"quizzes", "students"})
    Optional<Path> findById(Long id);
}

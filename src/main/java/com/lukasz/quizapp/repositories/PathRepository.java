package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PathRepository extends JpaRepository<Path, Long> {
    List<Path> findAllByTeachers(User user);
}

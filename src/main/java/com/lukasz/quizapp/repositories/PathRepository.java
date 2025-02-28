package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Path;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PathRepository extends JpaRepository<Path, Long> {
}

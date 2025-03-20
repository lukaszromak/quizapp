package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}

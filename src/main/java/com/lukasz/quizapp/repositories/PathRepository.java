package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PathRepository extends CrudRepository<Path, Long> {
    @Query("SELECT p FROM Path p JOIN p.students s WHERE s.id = :id")
    List<Path> findAllByStudentId(@Param("id") Long id);

    List<Path> findAllByTeacher(User user);

    @EntityGraph(value = "path-entity-graph")
    Optional<Path> findById(Long id);
}

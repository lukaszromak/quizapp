package com.lukasz.quizapp.repositories;

import com.lukasz.quizapp.entities.ERole;
import com.lukasz.quizapp.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}

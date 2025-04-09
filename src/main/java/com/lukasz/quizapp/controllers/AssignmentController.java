package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.AssignmentDto;
import com.lukasz.quizapp.entities.Assignment;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.services.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.lukasz.quizapp.services.AssignmentService.mapAssignmentToAssignmentDto;

@RestController
@RequestMapping("/api/assignment")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @Autowired
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDto> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(mapAssignmentToAssignmentDto(assignmentService.read(id, true), true));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto assignmentDto) throws PathNotFoundException {
        return ResponseEntity.ok(assignmentService.save(assignmentDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<AssignmentDto> updateAssignment(@RequestBody AssignmentDto assignmentDto) {
        return ResponseEntity.ok(assignmentService.update(assignmentDto));
    }
}

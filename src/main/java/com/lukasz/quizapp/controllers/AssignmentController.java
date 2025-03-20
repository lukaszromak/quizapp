package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.dto.AssignmentDto;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.services.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/assignment")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @Autowired
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto assignmentDto) throws PathNotFoundException {
        return ResponseEntity.ok(assignmentService.save(assignmentDto));
    }

}

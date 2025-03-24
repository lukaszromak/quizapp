package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.entities.Solve;
import com.lukasz.quizapp.services.SolveService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("solve")
public class SolveController {

    private final SolveService solveService;

    public SolveController(SolveService solveService) {
        this.solveService = solveService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Solve> getSolve(@PathVariable Long id) {
        return ResponseEntity.ok(solveService.read(id));
    }
}

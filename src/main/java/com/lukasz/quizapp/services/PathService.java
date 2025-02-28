package com.lukasz.quizapp.services;

import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.repositories.PathRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PathService {

    private final PathRepository pathRepository;

    @Autowired
    public PathService(PathRepository pathRepository) {
        this.pathRepository = pathRepository;
    }

    public Path read(Long id) throws PathNotFoundException {
        Optional<Path> pathOptional = pathRepository.findById(id);

        if(pathOptional.isEmpty()) {
            throw new PathNotFoundException(String.format("Path with id %d not found.", id));
        }

        return pathOptional.get();
    }

    public Path save(Path path) {
        return pathRepository.save(path);
    }

}

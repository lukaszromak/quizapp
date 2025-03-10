package com.lukasz.quizapp.services;

import com.lukasz.quizapp.entities.Path;
import com.lukasz.quizapp.entities.Quiz;
import com.lukasz.quizapp.entities.User;
import com.lukasz.quizapp.exception.PathNotFoundException;
import com.lukasz.quizapp.repositories.PathRepository;
import com.lukasz.quizapp.repositories.QuizRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class PathService {

    private final PathRepository pathRepository;

    private final QuizRepository quizRepository;

    @Autowired
    public PathService(PathRepository pathRepository, QuizRepository quizRepository) {
        this.pathRepository = pathRepository;
        this.quizRepository = quizRepository;
    }

    public Path read(Long id) throws PathNotFoundException {
        Optional<Path> pathOptional = pathRepository.findById(id);

        if(pathOptional.isEmpty()) {
            throw new PathNotFoundException(String.format("Path with id %d not found.", id));
        }

        return pathOptional.get();
    }

    public List<Path> read(User user) {
        return pathRepository.findAllByTeachers(user);
    }

    @Transactional
    public Path save(Path path) {
        List<Long> quizIds = path.getQuizzes().stream()
                .map(Quiz::getId)
                .collect(Collectors.toList());

        List<Quiz> quizList = StreamSupport.stream(quizRepository.findAllById(quizIds).spliterator(), false)
                .collect(Collectors.toList());

        path.setQuizzes(quizList);

        return pathRepository.save(path);
    }

}

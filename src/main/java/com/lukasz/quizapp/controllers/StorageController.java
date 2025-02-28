package com.lukasz.quizapp.controllers;

import com.lukasz.quizapp.services.StorageService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping(value = "/quiz/images/{id}", produces = MediaType.IMAGE_JPEG_VALUE)
    public @ResponseBody byte[] readQuizImage(@PathVariable String id) {
        return storageService.read(String.format("/quiz/images/%s", id));
    }
}

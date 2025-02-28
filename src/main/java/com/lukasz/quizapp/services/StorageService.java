package com.lukasz.quizapp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class StorageService {

    private final Path root = Paths.get("C:\\uploads");

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    public StorageService() {

    }

    public String save(String directory, MultipartFile multipartFile) {
        try {
            if(multipartFile.getSize() <= 1) return null;
            UUID uuid = UUID.randomUUID();
            String extension = multipartFile.getOriginalFilename().substring(multipartFile.getOriginalFilename().lastIndexOf(".") + 1);
            String path = String.format("%s/%s.%s", directory, uuid, extension);
            Files.copy(multipartFile.getInputStream(), this.root.resolve(path));
            return path;
        } catch (IOException exception) {
            exception.printStackTrace();
            logger.error("Error while saving file");
        }

        return null;
    }

    public byte[] read(String name) {
        try {
            if (name.startsWith("/quiz/images")) {
                return Files.readAllBytes(this.root.resolve(name));
            } else {
                throw new IllegalArgumentException("Invalid file name.");
            }
        } catch (IOException exception) {
            exception.printStackTrace();
            logger.error("Error while reading {} file", name);
        } catch (IllegalArgumentException exception) {
            logger.error("{} is not a valid path", name);
        }

        return null;
    }
}

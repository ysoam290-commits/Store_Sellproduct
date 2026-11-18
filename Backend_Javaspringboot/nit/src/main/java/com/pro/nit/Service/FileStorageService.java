
package com.pro.nit.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath = Paths.get("uploads");

    public String saveImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Image file is required!"
            );
        }

        // Maximum image size: 5 MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image size cannot exceed 5 MB!"
            );
        }

        // Validate image content type
        String contentType = file.getContentType();

        if (contentType == null ||
                !contentType.matches("image/(jpeg|png|webp)")) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed!"
            );
        }

        try {

            Files.createDirectories(uploadPath);

            String extension;

            switch (contentType) {
                case "image/jpeg" -> extension = ".jpg";
                case "image/png" -> extension = ".png";
                case "image/webp" -> extension = ".webp";
                default -> throw new IllegalArgumentException(
                        "Unsupported image format!"
                );
            }

            String filename =
                    UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(filename);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return filename;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not save image: " + e.getMessage(),
                    e
            );
        }
    }
}

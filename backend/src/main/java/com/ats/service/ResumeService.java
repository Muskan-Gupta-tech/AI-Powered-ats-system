package com.ats.service;

import com.ats.model.*;
import com.ats.repository.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

@Service
public class ResumeService {
    @Autowired ResumeRepository resumeRepo;
    @Autowired JobRepository jobRepo;
    @Value("${file.upload-dir}") String uploadDir;

    private static final List<String> SKILL_KEYWORDS = List.of(
        "java","python","javascript","typescript","react","angular","vue","spring","springboot",
        "nodejs","express","django","flask","sql","mysql","postgresql","mongodb","redis",
        "docker","kubernetes","aws","azure","gcp","git","linux","html","css","rest","api",
        "microservices","machine learning","deep learning","tensorflow","pytorch","data science",
        "hadoop","spark","kafka","jenkins","ci/cd","agile","scrum","c++","c#",".net","php",
        "ruby","swift","kotlin","flutter","android","ios","excel","tableau","power bi"
    );

    private static final List<String> SKIP_WORDS = List.of(
        "resume","curriculum","vitae","cv","profile","contact","address",
        "phone","email","objective","summary","linkedin","portfolio",
        "declaration","references","education","experience","skills",
        "projects","internship","certifications","achievements","languages"
    );

    public Resume processAndSave(MultipartFile file, Long jobId, String candidateName, String email) throws Exception {
        JobDescription job = jobRepo.findById(jobId).orElseThrow();

        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = dir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String text = extractText(filePath.toFile());

        // Try to extract real name from PDF text
        String realName = extractNameFromText(text);
        String finalName = (realName != null && !realName.isBlank()) ? realName : candidateName;

        // Try to extract real email from PDF text
        String realEmail = extractEmailFromText(text);
        String finalEmail = (realEmail != null && !realEmail.isBlank()) ? realEmail : email;

        String skills = extractSkills(text);
        double score = calculateATS(skills, job.getRequiredSkills());

        Resume resume = new Resume();
        resume.setCandidateName(finalName);
        resume.setEmail(finalEmail);
        resume.setFileName(file.getOriginalFilename());
        resume.setFilePath(filePath.toString());
        resume.setExtractedText(text.length() > 5000 ? text.substring(0, 5000) : text);
        resume.setExtractedSkills(skills);
        resume.setAtsScore(score);
        resume.setJob(job);
        return resumeRepo.save(resume);
    }

    private String extractText(File file) {
        try (PDDocument doc = Loader.loadPDF(file)) {
            return new PDFTextStripper().getText(doc);
        } catch (Exception e) { return ""; }
    }

    private String extractNameFromText(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            line = line.trim();

            // Skip blank or too short/long
            if (line.isBlank()) continue;
            if (line.length() < 3 || line.length() > 60) continue;

            // Skip lines with special characters
            if (line.contains("@")) continue;
            if (line.contains("http")) continue;
            if (line.contains("+")) continue;
            if (line.contains("|")) continue;
            if (line.contains("/")) continue;
            if (line.contains("\\")) continue;
            if (line.contains(",")) continue;

            // Skip lines with numbers (phone, year, etc)
            if (line.matches(".*\\d{2,}.*")) continue;

            // Skip lines containing resume-related keywords
            String lower = line.toLowerCase();
            boolean skip = SKIP_WORDS.stream().anyMatch(lower::contains);
            if (skip) continue;

            // Must match a name pattern: 2 or more words, only letters
            if (line.matches("[A-Za-z]+(\\s[A-Za-z]+)+")) {
                // Capitalize each word properly
                return Arrays.stream(line.split("\\s+"))
                    .map(w -> w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
                    .collect(Collectors.joining(" "));
            }
        }
        return null;
    }

    private String extractEmailFromText(String text) {
        for (String word : text.split("[\\s,;<>()]+")) {
            word = word.trim();
            if (word.matches("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}")) {
                return word.toLowerCase();
            }
        }
        return null;
    }

    private String extractSkills(String text) {
        String lower = text.toLowerCase();
        return SKILL_KEYWORDS.stream()
            .filter(s -> lower.contains(s.toLowerCase()))
            .collect(Collectors.joining(", "));
    }

    private double calculateATS(String resumeSkills, String requiredSkills) {
        if (requiredSkills == null || requiredSkills.isBlank()) return 0;
        String[] required = requiredSkills.toLowerCase().split("[,\\s]+");
        long matched = Arrays.stream(required)
            .filter(s -> !s.isBlank() && resumeSkills.toLowerCase().contains(s))
            .count();
        return Math.round((double) matched / required.length * 100.0);
    }
}
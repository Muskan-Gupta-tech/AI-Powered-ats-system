package com.ats.controller;

import com.ats.model.Resume;
import com.ats.repository.ResumeRepository;
import com.ats.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController @RequestMapping("/api/resumes")
public class ResumeController {
    @Autowired ResumeService resumeService;
    @Autowired ResumeRepository resumeRepo;

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobId") Long jobId,
            @RequestParam("candidateName") String candidateName,
            @RequestParam("email") String email) {
        try {
            Resume r = resumeService.processAndSave(file, jobId, candidateName, email);
            return ResponseEntity.ok(r);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/job/{jobId}")
    public List<Resume> getByJob(@PathVariable Long jobId) {
        return resumeRepo.findByJobIdOrderByAtsScoreDesc(jobId);
    }

    @GetMapping("/search")
    public List<Resume> search(@RequestParam String name) {
        return resumeRepo.findByCandidateNameContainingIgnoreCase(name);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        resumeRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

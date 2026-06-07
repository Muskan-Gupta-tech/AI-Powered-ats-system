package com.ats.controller;

import com.ats.model.*;
import com.ats.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/jobs")
public class JobController {
    @Autowired JobRepository jobRepo;

    @GetMapping
    public List<JobDescription> getAll(Authentication auth) {
        Recruiter r = (Recruiter) auth.getPrincipal();
        return jobRepo.findByRecruiterId(r.getId());
    }

    @PostMapping
    public JobDescription create(@RequestBody JobDescription job, Authentication auth) {
        job.setRecruiter((Recruiter) auth.getPrincipal());
        return jobRepo.save(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        jobRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

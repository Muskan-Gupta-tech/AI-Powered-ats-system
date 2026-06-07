package com.ats.repository;

import com.ats.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByJobIdOrderByAtsScoreDesc(Long jobId);
    List<Resume> findByCandidateNameContainingIgnoreCase(String name);
}

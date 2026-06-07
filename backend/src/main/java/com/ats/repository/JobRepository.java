package com.ats.repository;

import com.ats.model.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByRecruiterId(Long recruiterId);
}

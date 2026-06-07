package com.ats.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "resumes")
public class Resume {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String candidateName;
    private String email;
    private String fileName;
    private String filePath;
    @Column(columnDefinition = "TEXT") private String extractedText;
    @Column(columnDefinition = "TEXT") private String extractedSkills;
    private Double atsScore;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "job_id")
    private JobDescription job;
}

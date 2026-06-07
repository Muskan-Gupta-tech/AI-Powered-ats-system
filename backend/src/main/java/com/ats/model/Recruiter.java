package com.ats.model;

import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name = "recruiters")
public class Recruiter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true) private String email;
    private String password;
    private String company;
}

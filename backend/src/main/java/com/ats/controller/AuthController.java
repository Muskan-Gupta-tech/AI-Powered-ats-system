package com.ats.controller;

import com.ats.model.Recruiter;
import com.ats.repository.RecruiterRepository;
import com.ats.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    @Autowired RecruiterRepository repo;
    @Autowired JwtUtil jwtUtil;
    @Autowired PasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Recruiter recruiter) {
        if (repo.existsByEmail(recruiter.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        recruiter.setPassword(encoder.encode(recruiter.getPassword()));
        repo.save(recruiter);
        return ResponseEntity.ok(Map.of("message", "Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return repo.findByEmail(body.get("email"))
            .filter(r -> encoder.matches(body.get("password"), r.getPassword()))
            .map(r -> ResponseEntity.ok(Map.of(
                "token", jwtUtil.generate(r.getEmail()),
                "name", r.getName(),
                "id", r.getId()
            )))
            .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }
}

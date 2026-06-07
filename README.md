# ATS Resume Shortlisting System

## Prerequisites
- Java 17+
- MySQL 8+
- Maven

---

## Backend Setup (Spring Boot)

1. Create MySQL database:
```sql
CREATE DATABASE ats_db;
```

2. Edit `backend/src/main/resources/application.properties`:
```
spring.datasource.username=your_mysql_user
spring.datasource.password=your_mysql_password
```

3. Run backend:
```bash
cd backend
mvn spring-boot:run
```
Backend starts at: http://localhost:8080

---

## Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```
Frontend starts at: http://localhost:3000

---

## Features
- Recruiter Signup / Login (JWT Auth)
- Create & manage Job Descriptions with required skills
- Upload multiple PDF resumes per job
- Auto skill extraction from PDF using Apache PDFBox
- ATS score calculated by matching resume skills vs job skills
- Candidates ranked by ATS score (highest first)
- Color-coded score badges (Green ≥70%, Yellow ≥40%, Red <40%)
- Search candidates by name
- Delete jobs & resumes

## Project Structure
```
ats-system/
├── backend/          (Spring Boot)
│   ├── pom.xml
│   └── src/main/java/com/ats/
│       ├── AtsApplication.java
│       ├── model/         (Recruiter, JobDescription, Resume)
│       ├── repository/    (3 JPA repos)
│       ├── service/       (ResumeService - PDF + ATS logic)
│       ├── controller/    (AuthController, JobController, ResumeController)
│       ├── security/      (JwtUtil, JwtFilter)
│       └── config/        (SecurityConfig)
└── frontend/         (React)
    └── src/
        ├── App.js
        ├── context/   (AuthContext)
        ├── services/  (api.js)
        ├── components/(Navbar)
        └── pages/     (Login, Signup, Dashboard, Jobs, Resumes)
```

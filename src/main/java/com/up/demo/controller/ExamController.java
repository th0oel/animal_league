package com.up.demo.controller;

import com.up.demo.entity.Exam;
import com.up.demo.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    // 2.1 시험 일정 입력 (임시로 userId를 경로로 받음)
    @PostMapping("/{userId}")
    public ResponseEntity<Exam> createExam(@PathVariable Long userId, @RequestBody Exam exam) {
        Exam savedExam = examService.createExam(userId, exam);
        return new ResponseEntity<>(savedExam, HttpStatus.CREATED);
    }

    // 2.2 특정 유저의 전체 시험 일정 조회
    @GetMapping("/{userId}")
    public ResponseEntity<List<Exam>> getExams(@PathVariable Long userId) {
        List<Exam> exams = examService.getExamsByUserId(userId);
        return ResponseEntity.ok(exams);
    }
}
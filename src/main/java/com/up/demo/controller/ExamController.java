package com.up.demo.controller;

import com.up.demo.controller.dto.ApiResponse;
import com.up.demo.controller.dto.CreateExamRequest;
import com.up.demo.controller.dto.ExamResponse;
import com.up.demo.entity.Exam;
import com.up.demo.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(@RequestBody CreateExamRequest request) {
        Exam exam = new Exam();
        exam.setSubject(request.getSubject());
        exam.setExamDate(request.getExamDate());

        Exam savedExam = examService.createExam(exam);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED.value(), "시험 일정이 생성되었습니다.", ExamResponse.from(savedExam)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExams() {
        List<ExamResponse> data = examService.getMyExams()
                .stream()
                .map(ExamResponse::from)
                .toList();

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK.value(), "시험 일정 조회 성공", data));
    }
}
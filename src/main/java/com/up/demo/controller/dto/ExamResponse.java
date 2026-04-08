package com.up.demo.controller.dto;

import com.up.demo.entity.Exam;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class ExamResponse {
    private Long id;
    private String subject;
    private LocalDate examDate;
    private Integer difficulty;
    private Integer understanding;
    private Long userId;

    public static ExamResponse from(Exam exam) {
        return new ExamResponse(
                exam.getId(),
                exam.getSubject(),
                exam.getExamDate(),
                exam.getDifficulty(),
                exam.getUnderstanding(),
                exam.getUser() == null ? null : exam.getUser().getId()
        );
    }
}

package com.up.demo.service;

import com.up.demo.entity.Exam;
import com.up.demo.entity.User;
import com.up.demo.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public Exam createExam(Exam examData) {
        if (examData == null || isBlank(examData.getSubject()) || examData.getExamDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "subject, examDate는 필수입니다.");
        }

        User user = currentUserService.getCurrentUser();

        examData.setSubject(examData.getSubject().trim());
        examData.setUser(user); // 시험 일정에 주인(유저) 설정
        return examRepository.save(examData);
    }

    @Transactional(readOnly = true)
    public List<Exam> getMyExams() {
        return examRepository.findByUserId(currentUserService.getCurrentUserId());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
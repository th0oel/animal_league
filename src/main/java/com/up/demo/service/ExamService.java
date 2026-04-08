package com.up.demo.service;

import com.up.demo.entity.Exam;
import com.up.demo.entity.User;
import com.up.demo.repository.ExamRepository;
import com.up.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    // 2.1 시험 일정 입력 로직
    @Transactional
    public Exam createExam(Long userId, Exam examData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("해당 유저를 찾을 수 없습니다."));

        examData.setUser(user); // 시험 일정에 주인(유저) 설정
        return examRepository.save(examData);
    }

    // 2.2 전체 시험 일정 조회 로직
    @Transactional(readOnly = true)
    public List<Exam> getExamsByUserId(Long userId) {
        return examRepository.findByUserId(userId);
    }
}
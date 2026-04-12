package com.up.demo.repository;

import com.up.demo.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    // 특정 유저의 모든 시험 일정을 찾는 기능 추가
    List<Exam> findByUserId(Long userId);
}
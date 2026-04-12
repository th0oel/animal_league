package com.up.demo.repository;

import com.up.demo.entity.Calendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CalendarRepository extends JpaRepository<Calendar, Long> {
    // 유저 ID를 통해 해당 유저의 캘린더를 가져오는 메서드
    Optional<Calendar> findByUserId(Long userId);
}
package com.up.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "calendars")
public class Calendar extends BaseEntity {

    private String calendarName; // 캘린더 이름 등 추가 정보

    // FK: user_id (1:1 관계)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
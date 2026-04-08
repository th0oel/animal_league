// ============================================
// Study Plan Wizard - Multi Subject Step Script
// ============================================

const MAX_SUBJECTS = 10;
let currentStep = 0;
let subjectEntries = [createEmptyEntry()];
let selectedUnderstanding = 1;

const elements = {};

/**
 * 페이지 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  requireLogin();
  cacheElements();
  bindEvents();
  renderCurrentStep();
});

function createEmptyEntry() {
  return {
    subject: '',
    examDate: '',
    difficulty: 5,
    understanding: 1
  };
}

function cacheElements() {
  elements.title = document.getElementById('wizard-title');
  elements.stepLabel = document.getElementById('subject-step-label');
  elements.stepCount = document.getElementById('subject-step-count');
  elements.summary = document.getElementById('subject-summary');
  elements.subjectInput = document.getElementById('subject-input');
  elements.examDateInput = document.getElementById('exam-date-input');
  elements.difficultySlider = document.getElementById('difficulty-slider');
  elements.difficultyBadge = document.querySelector('.difficulty-badge');
  elements.understandingButtons = document.querySelectorAll('.understanding-btn');
  elements.generateBtn = document.getElementById('generate-btn');
  elements.prevBtn = document.getElementById('previous-step-btn');
  elements.nextBtn = document.getElementById('next-step-btn');
  elements.deleteBtn = document.getElementById('delete-step-btn');
  elements.progressBadge = document.getElementById('subject-progress-badge');
}

function bindEvents() {
  if (elements.difficultySlider) {
    elements.difficultySlider.addEventListener('input', function() {
      if (elements.difficultyBadge) {
        elements.difficultyBadge.textContent = getDifficultyText(this.value);
      }
      syncCurrentEntryFromInputs();
    });
  }

  elements.understandingButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      selectedUnderstanding = parseInt(this.dataset.value, 10);
      syncUnderstandingButtons();
      syncCurrentEntryFromInputs();
    });
  });

  elements.subjectInput?.addEventListener('input', syncCurrentEntryFromInputs);
  elements.examDateInput?.addEventListener('input', syncCurrentEntryFromInputs);

  elements.generateBtn?.addEventListener('click', async function(e) {
    e.preventDefault();
    await handleFormSubmit();
  });

  elements.prevBtn?.addEventListener('click', function() {
    goToPreviousStep();
  });

  elements.nextBtn?.addEventListener('click', function() {
    goToNextStep();
  });

  elements.deleteBtn?.addEventListener('click', function() {
    deleteCurrentStep();
  });

  // 모바일 하단 네비게이션
  const mobileNavLinks = document.querySelectorAll('nav.md\\:hidden a');
  mobileNavLinks.forEach(link => {
    const href = link.querySelector('span:last-child')?.textContent.trim();
    if (href === 'Plan') link.href = './study-plan-wizard.html';
    if (href === 'Calendar') link.href = './calendar.html';
    if (href === 'Stats') link.href = './stats.html';
    if (href === 'Profile') link.href = './profile.html';
  });
}

function syncCurrentEntryFromInputs() {
  const entry = subjectEntries[currentStep];
  if (!entry) return;

  entry.subject = elements.subjectInput?.value.trim() || '';
  entry.examDate = elements.examDateInput?.value || '';
  entry.difficulty = parseInt(elements.difficultySlider?.value || '5', 10);
  entry.understanding = selectedUnderstanding;
}

function syncUnderstandingButtons() {
  elements.understandingButtons.forEach(button => {
    const isActive = parseInt(button.dataset.value, 10) === selectedUnderstanding;
    button.classList.toggle('border-[#4355b9]', isActive);
    button.classList.toggle('bg-[#4355b9]/5', isActive);
    button.classList.toggle('text-[#4355b9]', isActive);
    button.classList.toggle('border-transparent', !isActive);
    button.classList.toggle('bg-[#f6fafe]', !isActive);
    button.classList.toggle('text-[#00113a]/50', !isActive);
  });
}

function renderCurrentStep() {
  const entry = subjectEntries[currentStep] || createEmptyEntry();

  if (elements.title) {
    elements.title.textContent = `Study Plan Wizard (${currentStep + 1})`;
  }
  if (elements.stepLabel) {
    elements.stepLabel.textContent = `과목 ${currentStep + 1} 입력 중`;
  }
  if (elements.stepCount) {
    elements.stepCount.textContent = `${currentStep + 1} / ${MAX_SUBJECTS}`;
  }
  if (elements.progressBadge) {
    elements.progressBadge.textContent = `${currentStep + 1} / ${MAX_SUBJECTS}`;
  }
  if (elements.subjectInput) elements.subjectInput.value = entry.subject;
  if (elements.examDateInput) elements.examDateInput.value = entry.examDate;
  if (elements.difficultySlider) elements.difficultySlider.value = entry.difficulty;
  if (elements.difficultyBadge) elements.difficultyBadge.textContent = getDifficultyText(entry.difficulty);

  selectedUnderstanding = entry.understanding || 1;
  syncUnderstandingButtons();
  updateSummary();
  updateNavButtons();
}

function updateSummary() {
  if (!elements.summary) return;

  const filledEntries = subjectEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.subject || entry.examDate)
    .map(({ entry, index }) => `
      <div class="flex items-center justify-between rounded-xl border border-[#e4e9ed] bg-white px-4 py-3">
        <div>
          <p class="font-bold text-[#00113a]">${index + 1}. ${entry.subject || '새 과목'}</p>
          <p class="text-xs text-[#00113a]/60">${entry.examDate || '시험일 미입력'} · ${getDifficultyText(entry.difficulty)} · ${getUnderstandingText(entry.understanding)}</p>
        </div>
        <span class="text-xs font-bold text-[#4355b9]">Step ${index + 1}</span>
      </div>
    `)
    .join('');

  elements.summary.innerHTML = filledEntries || '<div class="text-sm text-[#00113a]/50 px-1 py-2">아직 저장된 과목이 없습니다. 현재 과목을 입력한 뒤 다음을 눌러 추가할 수 있습니다.</div>';
}

function updateNavButtons() {
  if (elements.prevBtn) {
    elements.prevBtn.disabled = currentStep === 0;
    elements.prevBtn.classList.toggle('opacity-40', currentStep === 0);
    elements.prevBtn.classList.toggle('cursor-not-allowed', currentStep === 0);
  }

  if (elements.nextBtn) {
    const isLastExistingStep = currentStep === subjectEntries.length - 1;
    elements.nextBtn.textContent = isLastExistingStep && subjectEntries.length < MAX_SUBJECTS ? '다음 과목 추가' : '다음';
    elements.nextBtn.disabled = false;
  }

  if (elements.deleteBtn) {
    const isOnlyEntry = subjectEntries.length === 1;
    elements.deleteBtn.disabled = isOnlyEntry;
    elements.deleteBtn.classList.toggle('opacity-40', isOnlyEntry);
    elements.deleteBtn.classList.toggle('cursor-not-allowed', isOnlyEntry);
    elements.deleteBtn.title = isOnlyEntry ? '마지막 과목은 삭제할 수 없습니다.' : '현재 과목 삭제';
  }
}

function goToPreviousStep() {
  syncCurrentEntryFromInputs();
  if (currentStep === 0) {
    return;
  }
  currentStep -= 1;
  renderCurrentStep();
}

function goToNextStep() {
  syncCurrentEntryFromInputs();

  if (currentStep < subjectEntries.length - 1) {
    currentStep += 1;
    renderCurrentStep();
    return;
  }

  if (subjectEntries.length >= MAX_SUBJECTS) {
    alert(`과목은 최대 ${MAX_SUBJECTS}개까지 입력할 수 있습니다.`);
    return;
  }

  subjectEntries.push(createEmptyEntry());
  currentStep = subjectEntries.length - 1;
  renderCurrentStep();
}

function deleteCurrentStep() {
  if (subjectEntries.length <= 1) {
    return;
  }

  if (!confirm('현재 과목을 삭제할까요?')) {
    return;
  }

  syncCurrentEntryFromInputs();


  subjectEntries.splice(currentStep, 1);

  if (currentStep >= subjectEntries.length) {
    currentStep = subjectEntries.length - 1;
  }

  if (currentStep < 0) {
    currentStep = 0;
  }

  const activeEntry = subjectEntries[currentStep] || createEmptyEntry();
  selectedUnderstanding = activeEntry.understanding || 1;
  renderCurrentStep();
}

function normalizeEntries() {
  return subjectEntries
    .map(entry => ({
      subject: entry.subject.trim(),
      examDate: entry.examDate,
      difficulty: parseInt(entry.difficulty, 10),
      understanding: parseInt(entry.understanding, 10)
    }))
    .filter(entry => entry.subject || entry.examDate);
}

function validateEntries(entries) {
  if (entries.length === 0) {
    return '최소 1개의 과목을 입력해주세요!';
  }

  for (const [index, entry] of entries.entries()) {
    if (!entry.subject || !entry.examDate || !entry.difficulty || !entry.understanding) {
      return `${index + 1}번째 과목의 모든 필드를 입력해주세요!`;
    }
  }

  return '';
}

/**
 * 폼 제출 처리
 */
async function handleFormSubmit() {
  syncCurrentEntryFromInputs();

  const entries = normalizeEntries();
  const validationError = validateEntries(entries);
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    let calendarLookupError = null;

    try {
      await getCalendar();
    } catch (e) {
      if (e.status === 404) {
        const userInfo = getUserInfo();
        const calendarName = userInfo?.email || 'My Calendar';
        await createCalendar(calendarName);
      } else {
        calendarLookupError = e;
      }
    }

    if (calendarLookupError) {
      alert(`❌ 오류: ${calendarLookupError.message || '캘린더 조회 실패'}`);
      return;
    }

    for (const entry of entries) {
      await createExam(
        entry.subject,
        entry.examDate,
        entry.difficulty,
        entry.understanding
      );
    }

    alert(`✅ ${entries.length}개의 시험 일정이 생성되었습니다!\n캘린더로 이동합니다.`);
    window.location.href = './calendar.html';
  } catch (error) {
    alert(`❌ 오류: ${error.message}`);
    console.error('Form submission error:', error);
  }
}


console.log('✅ study-plan.js 로드 완료');


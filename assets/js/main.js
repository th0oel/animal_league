// ============================================
// Utopia Planner - Main Application Script
// ============================================

// 설정
const API_BASE_URL = 'http://localhost:8080/api/v1';
const AUTH_TOKEN_KEY = 'utopia_auth_token';
const USER_INFO_KEY = 'utopia_user_info';
const GAMEIFY_CONSENT_KEY = 'gameify_consent';

let evasivePopupTimerId = null;
let isEvasivePopupOpen = false;

// ============================================
// 1. API 요청 함수들
// ============================================

/**
 * API 요청 기본 함수
 */
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || '요청 실패',
                data
            };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * 회원가입
 */
async function registerUser(name, email, password) {
    return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({name, email, password})
    });
}

/**
 * 로그인
 */
async function loginUser(email, password) {
    const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password})
    });

    if (response.data && response.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify({email}));
        return true;
    }
    return false;
}

/**
 * 로그아웃
 */
function logoutUser() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    window.location.href = '/index.html';
}

/**
 * 캘린더 생성
 */
async function createCalendar(calendarName) {
    return apiCall('/calendars', {
        method: 'POST',
        body: JSON.stringify({calendarName})
    });
}

/**
 * 캘린더 조회
 */
async function getCalendar() {
    return apiCall('/calendars', {
        method: 'GET'
    });
}

/**
 * 시험 일정 생성
 */
async function createExam(subject, examDate, difficulty, understanding) {
    return apiCall('/exams', {
        method: 'POST',
        body: JSON.stringify({
            subject,
            examDate,
            difficulty: parseInt(difficulty),
            understanding: parseInt(understanding)
        })
    });
}

/**
 * 시험 일정 목록 조회
 */
async function getExams() {
    return apiCall('/exams', {
        method: 'GET'
    });
}

// ============================================
// 2. 인증 상태 관리
// ============================================

/**
 * 로그인 상태 확인
 */
function isLoggedIn() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 로그인 페이지로 리다이렉트 (필요시)
 */
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = '/index.html';
    }
}

/**
 * 사용자 정보 가져오기
 */
function getUserInfo() {
    const info = localStorage.getItem(USER_INFO_KEY);
    return info ? JSON.parse(info) : null;
}

// ============================================
// 3. 페이지 상태 관리
// ============================================

/**
 * index.html 페이지 초기화
 */
function initIndexPage() {
    const isLoggedIn_status = isLoggedIn();
    const loginStatusEl = document.getElementById('login-status');
    const buttonContainer = document.getElementById('button-container');
    const logoutBtn = document.getElementById('logout-btn');

    if (!loginStatusEl || !buttonContainer) return;

    if (isLoggedIn_status) {
        // 로그인 상태
        loginStatusEl.textContent = '로그인 완료';
        if (logoutBtn) {
            logoutBtn.classList.remove('hidden');
        }
        buttonContainer.innerHTML = `
      <a href="pages/study-plan-wizard.html" class="px-6 py-4 rounded-2xl bg-indigo-900 text-white font-bold shadow-lg inline-block text-center no-underline">
        과목 정보 입력
      </a>
      <a href="pages/calendar.html" class="px-6 py-4 rounded-2xl border border-slate-300 bg-white font-bold text-center no-underline">
        캘린더로 이동
      </a>
    `;
    } else {
        // 비로그인 상태
        loginStatusEl.textContent = '로그인 필요';
        if (logoutBtn) {
            logoutBtn.classList.add('hidden');
        }
        buttonContainer.innerHTML = `
      <button onclick="showLoginModal()" class="px-6 py-4 rounded-2xl bg-indigo-900 text-white font-bold shadow-lg">
        로그인
      </button>
      <button onclick="showRegisterModal()" class="px-6 py-4 rounded-2xl border border-slate-300 bg-white font-bold">
        회원가입
      </button>
    `;
    }
}

// ============================================
// 4. 로그인/회원가입 모달
// ============================================

/**
 * 로그인 모달 표시
 */
function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.innerHTML = `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick="closeLoginModal()">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <h2 class="text-2xl font-bold mb-6 text-indigo-900">로그인</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
            <input id="login-email" type="email" placeholder="your@email.com" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-900">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
            <input id="login-password" type="password" placeholder="비밀번호 입력" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-900">
          </div>
          
          <div id="login-error" class="text-red-600 text-sm hidden"></div>
          
          <button onclick="handleLogin()" class="w-full px-6 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-indigo-800 transition">
            로그인
          </button>
          
          <button onclick="closeLoginModal()" class="w-full px-6 py-3 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 transition">
            취소
          </button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

/**
 * 로그인 모달 닫기
 */
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.remove();
}

/**
 * 로그인 처리
 */
async function handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    const errorEl = document.getElementById('login-error');

    if (!email || !password) {
        if (errorEl) errorEl.textContent = '이메일과 비밀번호를 입력해주세요.';
        if (errorEl) errorEl.classList.remove('hidden');
        return;
    }

    try {
        const success = await loginUser(email, password);
        if (success) {
            closeLoginModal();
            initIndexPage();
            alert('로그인 성공!');
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = error.message || '로그인 실패';
            errorEl.classList.remove('hidden');
        }
    }
}

/**
 * 회원가입 모달 표시
 */
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.id = 'register-modal';
    modal.innerHTML = `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onclick="closeRegisterModal()">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4" onclick="event.stopPropagation()">
        <h2 class="text-2xl font-bold mb-6 text-indigo-900">회원가입</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">이름</label>
            <input id="register-name" type="text" placeholder="이름 입력" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-900">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
            <input id="register-email" type="email" placeholder="your@email.com" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-900">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
            <input id="register-password" type="password" placeholder="비밀번호 입력" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-900">
          </div>
          
          <div id="register-error" class="text-red-600 text-sm hidden"></div>
          
          <button onclick="handleRegister()" class="w-full px-6 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-indigo-800 transition">
            회원가입
          </button>
          
          <button onclick="closeRegisterModal()" class="w-full px-6 py-3 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 transition">
            취소
          </button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

/**
 * 회원가입 모달 닫기
 */
function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.remove();
}

/**
 * 회원가입 처리
 */
async function handleRegister() {
    const name = document.getElementById('register-name')?.value;
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    const errorEl = document.getElementById('register-error');

    if (!name || !email || !password) {
        if (errorEl) errorEl.textContent = '모든 필드를 입력해주세요.';
        if (errorEl) errorEl.classList.remove('hidden');
        return;
    }

    try {
        await registerUser(name, email, password);
        alert('회원가입 성공! 이제 로그인해주세요.');
        closeRegisterModal();
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = error.message || '회원가입 실패';
            errorEl.classList.remove('hidden');
        }
    }
}

// ============================================
// 5. 페이지 로드 이벤트
// ============================================

/**
 * 페이지 로드 시 실행
 */
document.addEventListener('DOMContentLoaded', function () {
    // index.html 초기화
    if (document.getElementById('login-status')) {
        initIndexPage();
    }
});

// ============================================
// 6. 유튜브 팝업 함수
// ============================================

/**
 * 유튜브 URL에서 비디오 ID 추출
 */
function extractYouTubeVideoId(url) {
    const regexPatterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,  // youtube.com/watch?v=ID
        /(?:youtu\.be\/)([^&\n?#]+)/,              // youtu.be/ID
        /(?:youtube\.com\/shorts\/)([^&\n?#]+)/    // youtube.com/shorts/ID
    ];

    for (const regex of regexPatterns) {
        const match = url.match(regex);
        if (match) return match[1];
    }
    return null;
}

/**
 * 유튜브 팝업 표시
 */
function showYouTubePopup(videoId) {
    const popup = document.createElement('div');
    popup.id = 'youtube-popup';
    popup.innerHTML = `
    <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onclick="if(event.target.id === 'youtube-popup-backdrop') document.getElementById('youtube-popup').remove()" id="youtube-popup-backdrop">
      <div class="bg-slate-900 rounded-3xl shadow-2xl p-6 max-w-3xl w-full mx-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-white">🎬 재미있는 콘텐츠</h2>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-white cursor-pointer">
              <input type="checkbox" id="youtube-repeat-toggle" class="w-4 h-4" checked>
              <span class="text-sm font-semibold">반복재생</span>
            </label>
            <button onclick="document.getElementById('youtube-popup').remove()" class="text-white hover:text-red-400 transition text-3xl font-bold" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              ×
            </button>
          </div>
        </div>
        <div class="aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            id="youtube-iframe"
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playlist=${videoId}&loop=1"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(popup);

    // 반복재생 토글 기능
    const repeatToggle = document.getElementById('youtube-repeat-toggle');
    const iframeEl = document.getElementById('youtube-iframe');

    repeatToggle.addEventListener('change', () => {
        if (repeatToggle.checked) {
            // 반복재생 ON
            iframeEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playlist=${videoId}&loop=1`;
        } else {
            // 반복재생 OFF
            iframeEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
    });
}

// ============================================
// 7. 게임화 요소
// ============================================

/**
 * 게임화 팝업 동의 확인
 */
function showGameifyDisclaimer() {
    return confirm(
        '이 페이지에는 친구들과 함께 즐길 수 있는 재미 요소가 포함되어 있습니다.\n' +
        '계속하시겠습니까?'
    );
}

function isGameifyConsentGranted() {
    const raw = localStorage.getItem(GAMEIFY_CONSENT_KEY);
    // 기존 저장 포맷 차이를 모두 허용한다.
    return raw === 'true' || raw === '1' || raw === 'yes';
}

/**
 * 팝업 이벤트 표시
 */
function showEvasivePopup() {
    if (isEvasivePopupOpen || document.getElementById('evasive-popup')) {
        return;
    }

    const popupMessages = [
        '이해하고 자는 게 무작정 외우는 것보다 낫다',
        '컨디션 관리도 공부의 일부다',
        '내일 아침 머리가 맑을 때 하는 게 더 효율적이야',
        '이 개념은 어차피 안 나올 것 같은데',
        '밥을 잘 먹어야 뇌가 돌아간다',
        '스트레스 받으면서 하면 오히려 역효과야',
        '딱 이 영상 하나만 보고 시작해야지',
        '플래너 꾸미는 것도 공부 준비 과정이다'
    ];
    const popupMessage = popupMessages[Math.floor(Math.random() * popupMessages.length)];

    const redirectUrls = [
        "https://www.youtube.com/shorts/Xj1OawZD_1c",
        "https://www.youtube.com/shorts/s_p3R__i1SE",
        "https://www.youtube.com/shorts/tSWFWXS6IFs",
        "https://www.youtube.com/shorts/Vcx2gLYKZLg",
        "https://www.youtube.com/shorts/kScw6XzetmA",
        "https://www.youtube.com/shorts/wrm6lKqsnWI",
        "https://www.youtube.com/shorts/NsvmGBRB6xw",
        "https://www.youtube.com/watch?v=JUElshgMk4U",
        "https://www.youtube.com/watch?v=QUXKib-jfEM"
    ];
    const redirectUrl = redirectUrls[Math.floor(Math.random() * redirectUrls.length)];

    const popup = document.createElement('div');
    popup.id = 'evasive-popup';
    popup.innerHTML = `
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" id="popup-backdrop">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative" id="popup-content">
        <button id="evasive-close" class="absolute top-4 right-4 text-3xl font-bold cursor-pointer text-indigo-900 hover:text-red-600 transition" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          ×
        </button>
        <h2 class="text-2xl font-bold mb-4 text-indigo-900">🎮 팝업 광고</h2>
        <p class="text-slate-600 mb-6">${popupMessage}</p>
      </div>
    </div>
  `;

    document.body.appendChild(popup);
    isEvasivePopupOpen = true;

    const closeBtn = document.getElementById('evasive-close');
    let clickCount = 0;
    let evadeCount = 0;
    const maxClicks = 3;
    const maxEvades = 5;
    let evasionActive = true;

    function closePopup() {
        //document.removeEventListener('keydown', handleEscape);
        if (popup.parentNode) {
            popup.remove();
        }
        isEvasivePopupOpen = false;
    }

    // 닫기 버튼 회피 로직
    closeBtn.addEventListener('mouseover', () => {
        if (evadeCount < maxEvades && evasionActive) {
            const randomX = Math.random() * 150 - 75;
            const randomY = Math.random() * 150 - 75;
            closeBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
            evadeCount++;

            if (evadeCount >= maxEvades) {
                evasionActive = false;
                closeBtn.style.transform = 'translate(0, 0)';
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= maxClicks) {
            evasionActive = false;
            closeBtn.style.transform = 'translate(0, 0)';

                setTimeout(() => {
                    /*
                    const redirect = confirm(
                        '재미있는 콘텐츠로 이동할까요?\n' +
                        '(아니오를 누르면 캘린더로 돌아갑니다)'
                    );
                    */

                    //if (redirect) {
                    const videoId = extractYouTubeVideoId(redirectUrl);
                    if (videoId) {
                        showYouTubePopup(videoId);
                    } else {
                        window.open(redirectUrl, '_blank');
                    }
                    //}

                    closePopup();
                }, 300);
        }
    });
    /*
    // ESC 키로 닫기 가능
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    }

    document.addEventListener('keydown', handleEscape);
    */

    /* Skip 버튼 추가
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip ⏭️';
    skipBtn.className = 'mt-4 w-full px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition';
    skipBtn.onclick = () => {
      closePopup();
    };
    const popupContent = document.getElementById('popup-content');
    popupContent.appendChild(skipBtn);
    */

}

function scheduleNextEvasivePopup(minDelayMs = 15000, maxDelayMs = 20000) {
    if (evasivePopupTimerId) {
        clearTimeout(evasivePopupTimerId);
    }

    const delay = Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;

    evasivePopupTimerId = setTimeout(() => {
        if (!isEvasivePopupOpen) {
            showEvasivePopup();
        }
        scheduleNextEvasivePopup(minDelayMs, maxDelayMs);
    }, delay);
}

function startEvasivePopupLoop(minDelayMs = 15000, maxDelayMs = 20000) {
    scheduleNextEvasivePopup(minDelayMs, maxDelayMs);
}

function startEvasivePopupLoopWithQuickFirst(
    minDelayMs = 15000,
    maxDelayMs = 20000,
    firstMinDelayMs = 2000,
    firstMaxDelayMs = 5000
) {
    stopEvasivePopupLoop();

    const firstDelay = Math.floor(Math.random() * (firstMaxDelayMs - firstMinDelayMs + 1)) + firstMinDelayMs;
    evasivePopupTimerId = setTimeout(() => {
        if (!isEvasivePopupOpen) {
            showEvasivePopup();
        }
        scheduleNextEvasivePopup(minDelayMs, maxDelayMs);
    }, firstDelay);
}

function stopEvasivePopupLoop() {
    if (evasivePopupTimerId) {
        clearTimeout(evasivePopupTimerId);
        evasivePopupTimerId = null;
    }
}

// ============================================
// 7. 유틸리티 함수
// ============================================

/**
 * 날짜를 "YYYY-MM-DD" 형식으로 변환
 */
function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * 난이도 텍스트로 변환
 */
function getDifficultyText(value) {
    value = parseInt(value);
    if (value <= 3) return '하 (Low)';
    if (value <= 6) return '중 (Intermediate)';
    return '상 (Critical)';
}

/**
 * 이해도 텍스트로 변환
 */
function getUnderstandingText(value) {
    value = parseInt(value);
    if (value === 1) return '입문자';
    if (value === 2) return '기초 수준';
    if (value === 3) return '심화 학습중';
    return '알 수 없음';
}

/**
 * 우선순위 배지 색상
 */
function getPriorityColor(priority) {
    if (priority === 1) return 'bg-red-100 text-red-800 border-red-300';
    if (priority === 2) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (priority === 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
}

console.log('✅ main.js 로드 완료');

import { firestoreFetch } from './firebase-rest';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// ResearchReflectionForm는 #research-log 분기에서만 동적 import
import ReactDOM from 'react-dom/client';
import Modal from './FolderCreateModal';
import PWAInstallPrompt from './PWAInstallPrompt';
import useModalAnimation from './useModalAnimation';
import ResearchReflectionForm from './ResearchReflectionForm';

// User 타입 직접 정의 (간단 버전)
type User = {
    uid: string;
    email?: string;
};
import { GoogleGenAI, Type } from '@google/genai';

// 모바일/스탠드얼론 감지 유틸
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}
function isStandalone() {
    // iOS PWA 또는 Android TWA 등 스탠드얼론 모드 감지
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator as any).standalone === true;
}
// --- 글로벌 Goal 타입 확장 (Collaborator 포함) ---
export {};
// Firestore 관련 함수 및 db 인스턴스 임포트 (이미 있다면 중복 제거 필요)
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase-config';
import App from './App';
// --- 임시 타입 정의 (실제 구조에 맞게 추후 보강 필요) ---
type Collaborator = {
    userId: string;
    email: string;
    role: string;
    addedAt?: string;
};
type Folder = {
    id: string;
    name: string;
    collaborators?: Collaborator[];
    ownerId?: string;
};
interface Goal {
    id: number;
    wish: string;
    outcome: string;
    obstacle: string;
    plan: string;
    isRecurring: boolean;
    recurringDays: number[];
    deadline: string;
    completed: boolean;
    lastCompletedDate: string | null;
    streak: number;
    collaborators?: Collaborator[];
}

// --- 번역 객체 ---
const translations = {
  ko: {
    // Auth
    language_selection_title: '언어',
    error_wish_required: '목표를 입력해주세요.',
    error_outcome_required: '결과를 입력해주세요.',
    error_obstacle_required: '장애물을 입력해주세요.',
    error_plan_required: "If-Then 계획을 입력해주세요.",
    error_deadline_required: '마감일을 선택해주세요.',
    error_day_required: '하나 이상의 요일을 선택해주세요.',

    // Main Page
    my_goals_title: '나의 목표',
    sort_label_manual: '수동',
    sort_label_deadline: '마감일순',
    sort_label_newest: '최신순',
    sort_label_alphabetical: '이름순',
    sort_label_ai: 'AI 추천',
    ai_sorting_button: '정렬 중...',
    add_new_goal_button_label: '새로운 목표 추가',
    filter_all: '모든 목표',
    filter_active: '진행중',
    filter_completed: '완료됨',
    empty_message_all: '첫 번째 목표를 추가하여 시작해보세요.',
    empty_message_active: '진행중인 목표가 없습니다.',
    empty_message_completed: '아직 완료된 목표가 없습니다.',
    empty_encouragement_1: '새로운 여정의 첫 걸음을 내딛어보세요.',
    empty_encouragement_2: '작은 변화가 큰 성취로 이어집니다.',
    empty_encouragement_3: '오늘 하는 일이 내일을 만듭니다.',
    empty_encouragement_4: '당신의 목표가 현실이 되는 순간을 만나보세요.',
    delete_button: '삭제',
    edit_button_aria: '목표 편집',
    info_button_aria: '상세 정보',
    filter_title: '필터',
    sort_title: '정렬',
    filter_sort_button_aria: '필터 및 정렬',
    calendar_view_button_aria: '캘린더 보기',
    list_view_button_aria: '목록 보기',
    more_options_button_aria: '더 보기',
    select_button_label: '선택',
    cancel_selection_button_label: '취소',
    delete_selected_button_label: '{count}개 삭제',
    delete_selected_confirm_title: '목표 삭제',
    delete_selected_confirm_message: '선택한 {count}개의 목표가 영구적으로 삭제됩니다.',
    days_left: '{count}일 남음',
    d_day: 'D-DAY',
    days_overdue: '{count}일 지남',

    // Calendar
    month_names: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    day_names_short: ["일", "월", "화", "수", "목", "금", "토"],
    day_names_long: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
    calendar_header_month_format: '{year}년 {month}',
    calendar_view_day3: '3일',
    calendar_view_week: '주',
    calendar_view_month: '월',
    
    // Modals & Alerts
    settings_title: '설정',
    sort_alert_title: '정렬 실패',
    sort_alert_message: 'AI 추천 정렬을 사용하려면<br/>2개 이상의 목표가 필요합니다.',
    ai_sort_error_title: 'AI 정렬 오류',
    ai_sort_error_message: '지금은 목표를 정렬할 수 없습니다.',
    confirm_button: '확인',
    new_goal_modal_title: '새로운 목표',
    edit_goal_modal_title: '목표 편집',
    wish_label: '목표',
    outcome_label: '최상의 결과',
    obstacle_label: '장애물',
    plan_label: "If-Then 계획",
    deadline_label: '마감일',
    cancel_button: '취소',
    add_button: '추가',
    save_button: '저장',
    goal_details_modal_title: '목표 상세 정보',
    ai_coach_suggestion: '🤖 AI 코치',
    ai_analyzing: 'AI 분석 중...',
    close_button: '닫기',
    ai_sort_reason_modal_title: 'AI 정렬 재안',
    ai_sort_criteria: 'AI 정렬 기준',
    delete_account_final_confirm_title: '계정 삭제',
    delete_account_final_confirm_message: '계정을 포함한 모든 목표, 폴더, 설정, 데이터가 영구적으로 삭제되며, 이 작업은 되돌릴 수 없습니다.',
    delete_all_data_button: '계정 완전 삭제',
    settings_done_button: '완료',
    settings_section_data: '데이터 관리',
    settings_export_data: '내보내기',
    settings_import_data: '가져오기',
    import_confirm_title: '데이터 가져오기',
    import_confirm_message: '현재 목표를 새로운 데이터로 교체합니다. 이 작업은 되돌릴 수 없습니다.',
    import_success_toast: '데이터를 성공적으로 가져왔습니다.',
    import_error_alert_title: '가져오기 실패',
    import_error_alert_message: '파일을 읽는 중 오류가 발생했거나 파일 형식이 올바르지 않습니다.',
    settings_section_general: '일반',
    settings_section_info: '정보',
    settings_section_help: '사용방법',
    settings_dark_mode: '다크 모드',
    settings_language: '언어',
    settings_api_key: 'AI 도우미 설정',
    settings_api_key_placeholder: 'Gemini API 키 입력',
    settings_offline_mode: '오프라인 사용',
    settings_offline_mode_desc: 'AI 기능 없이 기본 앱 기능만 사용',
    language_name: '한국어 (대한민국)',
    language_modal_title: '언어',
    settings_section_background: '화면',
    settings_bg_default: '라이트',
    settings_bg_default_dark: '다크',
    settings_bg_pink: '핑크',
    settings_bg_cherry_noir: '체리 누아르',
    settings_bg_blue: '블루',
    settings_bg_deep_ocean: '오션',
    settings_bg_green: '그린',
    settings_bg_forest_green: '포레스트',
    settings_bg_purple: '퍼플',
    settings_bg_royal_purple: '로얄 퍼플',
    settings_version: '버전',
    settings_developer: '개발자',
    developer_name: 'GimGyuMin',
    settings_copyright: '저작권',
    copyright_notice: '© 2025 GimGyuMin. All Rights Reserved.',
    build_number: '빌드 번호',
    settings_data_header: '데이터 관리',
    settings_data_header_desc: '목표 데이터를 파일로 내보내거나, 파일에서 가져옵니다.',
    settings_background_header: '배경화면',
    settings_background_header_desc: '앱의 배경화면 스타일을 변경하여 개성을 표현해 보세요.',
    data_importing: '가져오는 중...',
    data_exporting: '내보내는 중...',
    data_deleting: '삭제 중...',
    url_import_title: 'URL에서 데이터 불러오기',
    url_import_message: 'URL의 데이터로 현재 목표 목록을 덮어쓰시겠습니까?',
    url_import_confirm: '불러오기',
    url_import_success: 'URL에서 데이터를 성공적으로 가져왔습니다!',
    url_import_error: 'URL의 데이터가 올바르지 않습니다.',
    settings_share_link_header: '링크로 공유',
    settings_generate_link: '공유 링크 생성',
    settings_copy_link: '복사',
    link_copied_toast: '링크가 클립보드에 복사되었습니다.',
    short_url_created: '📎 단축 URL이 생성되었습니다!',
    share_link_created: '🔗 공유 링크가 생성되었습니다!',
    short_url_failed: '⚠️ 단축 URL 생성에 실패하여 기본 링크를 사용합니다.',
    no_data_to_share: '공유할 목표가 없습니다. 먼저 목표를 추가해주세요.',

    // 사용방법
    usage_guide_tab: '사용방법',
    usage_guide_title: '사용 가이드',
    usage_basic_title: '목표 추가하기',
    usage_basic_desc: '1. 홈 화면에서 "목표 추가 및 편집" 버튼을 탭하세요.\n2. 목표, 결과, 장애물, 계획을 차례로 입력하세요.\n3. 마감일과 반복 요일을 선택하세요.\n4. "저장" 버튼을 눌러 목표를 추가하세요.',
    usage_ai_title: 'AI 기능 사용하기',
    usage_ai_desc: '• 목표 작성 시 "AI 제안" 버튼으로 개선된 목표를 받아보세요.\n• 목표 목록에서 "AI 정렬" 버튼으로 중요도 순 정렬이 가능합니다.\n• AI 분석을 통해 더 효과적인 목표 설정을 도와드립니다.\n\n※ AI 기능 사용을 위해서는 API 키 설정이 필요합니다.',
    usage_ai_setup_title: 'AI 기능 설정하기',
    usage_ai_setup_desc: '1. 설정 > 일반에서 API 키 입력란을 찾으세요.\n2. Google Gemini API 키를 입력하세요.\n3. API 키 발급 방법은 다음 Google 지원 문서를 참조하세요:\n   https://ai.google.dev/gemini-api/docs/api-key\n4. 키 입력 후 AI 기능이 활성화됩니다.',
    usage_share_title: '목표 공유하기',
    usage_share_desc: '1. 설정 > 공유에서 "목표 링크 생성" 버튼을 탭하세요.\n2. 자동으로 생성된 단축 링크를 확인하세요.\n3. "링크 복사" 버튼으로 클립보드에 복사하세요.\n4. 메신저나 이메일로 링크를 공유하세요.',
    usage_theme_title: '테마 변경하기',
    usage_theme_desc: '1. 설정 > 모양에서 다크 모드 토글을 사용하세요.\n2. 배경 테마에서 원하는 색상을 선택하세요.\n3. 기본, 핑크, 블루, 그린, 퍼플 테마 중 선택 가능합니다.\n4. 변경 사항은 즉시 적용됩니다.',
    usage_calendar_title: '캘린더 보기 사용하기',
    usage_calendar_desc: '1. 하단 탭에서 캘린더 아이콘을 탭하세요.\n2. 3일/주간/월간 보기를 선택할 수 있습니다.\n3. 날짜를 탭하여 해당 날의 목표를 확인하세요.\n4. 좌우 화살표로 날짜를 이동할 수 있습니다.',
    usage_offline_desc: '1. 설정 > 일반에서 "오프라인 모드" 토글을 켜세요.\n2. API 키 없이도 목표 추가, 편집, 삭제가 가능합니다.\n3. AI 기능은 사용할 수 없지만 모든 기본 기능은 정상 작동합니다.\n4. 데이터는 브라우저에 안전하게 저장됩니다.',
    
    // Goal Assistant
    goal_assistant_title: '새로운 목표',
    goal_assistant_mode_woop: 'WOOP 방식',
    goal_assistant_mode_automation: '빠른 생성',
    automation_title: '목표 시리즈 만들기',
    automation_base_name_label: '목표 이름',
    automation_base_name_placeholder: '예: 영어 단어 학습',
    automation_total_units_label: '총 분량',
    automation_total_units_placeholder: '예: 30',
    automation_units_per_day_label: '일일 분량',
    automation_period_label: '기간',
    automation_start_date_label: '시작일',
    automation_end_date_label: '종료일',
    automation_generate_button: '{count}개 생성',
    automation_error_all_fields: '모든 필드를 올바르게 입력해주세요.',
    automation_error_start_after_end: '시작일은 종료일보다 빨라야 합니다.',
    automation_error_short_period: '기간이 너무 짧습니다. (1일 이상)',

    next_button: '다음',
    back_button: '이전',
    wish_tip: '측정 가능하고 구체적인, 도전적이면서도 현실적인 목표를 설정하세요.',
    wish_example: '예: 3개월 안에 5kg 감량하기, 이번 학기에 A+ 받기',
    outcome_tip: '목표 달성 시 얻게 될 가장 긍정적인 결과를 생생하게 상상해 보세요.',
    outcome_example: '예: 더 건강하고 자신감 있는 모습, 성적 장학금 수령',
    obstacle_tip: '목표 달성을 방해할 수 있는 내면의 장애물(습관, 감정 등)은 무엇인가요?',
    obstacle_example: '예: 퇴근 후 피곤해서 운동 가기 싫은 마음, 어려운 과제를 미루는 습관',
    plan_tip: "'만약 ~라면, ~하겠다' 형식으로 장애물에 대한 구체적인 대응 계획을 세워보세요.",
    plan_example: '예: 만약 퇴근 후 운동 가기 싫다면, 일단 운동복으로 갈아입고 10분만 스트레칭한다.',
    recurrence_label: '반복',
    recurrence_tip: '정해진 요일에 꾸준히 해야 하는 목표인가요? 반복으로 설정하여 연속 달성을 기록해 보세요.',
    recurrence_example: '예: 매주 월,수,금 헬스장 가기',
    recurrence_option_daily: '반복 목표',
    deadline_tip: '현실적인 마감일을 설정하여 동기를 부여하세요. 마감일이 없는 장기 목표도 좋습니다.',
    deadline_option_no_deadline: '마감일 없음',
    day_names_short_picker: ["월", "화", "수", "목", "금", "토", "일"],
    version_update_title: '새로운 기능',
    version_update_1_title: 'AI 도우미 설정',
    version_update_1_desc: 'Gemini API 키를 직접 설정하거나 오프라인 모드로 AI 없이도 앱을 사용할 수 있습니다.',
    version_update_2_title: '목표 공유',
    version_update_2_desc: '목표를 링크로 공유하고 단축 URL로 쉽게 전달하세요. 한국어도 완벽하게 지원합니다.',
    version_update_3_title: '모던 스타일 UI',
    version_update_3_desc: '세련된 모던 디자인 언어와 모바일 최적화로 더욱 직관적인 경험을 제공합니다.',
  },
  en: {
    // Auth
    language_selection_title: 'Language',
    error_wish_required: 'Please enter your wish.',
    error_outcome_required: 'Please enter the outcome.',
    error_obstacle_required: 'Please enter the obstacle.',
    error_plan_required: "Please enter your If-Then plan.",
    error_deadline_required: 'Please select a deadline.',
    error_day_required: 'Please select at least one day.',

    // Main Page
    my_goals_title: 'My Goals',
    sort_label_manual: 'Manual',
    sort_label_deadline: 'Deadline',
    sort_label_newest: 'Newest',
    sort_label_alphabetical: 'Alphabetical',
    sort_label_ai: 'AI Recommended',
    ai_sorting_button: 'Sorting...',
    add_new_goal_button_label: 'Add New Goal',
    filter_all: 'All Goals',
    filter_active: 'In Progress',
    filter_completed: 'Completed',
    empty_message_all: 'Add your first goal to begin your journey.',
    empty_message_active: 'No goals in progress.',
    empty_message_completed: 'No completed goals yet.',
    empty_encouragement_1: 'Take the first step toward something amazing.',
    empty_encouragement_2: 'Small changes lead to big achievements.',
    empty_encouragement_3: 'What you do today shapes tomorrow.',
    empty_encouragement_4: 'Your goals are waiting to become reality.',
    delete_button: 'Delete',
    edit_button_aria: 'Edit Goal',
    info_button_aria: 'Details',
    filter_title: 'Filter',
    sort_title: 'Sort',
    filter_sort_button_aria: 'Filter and Sort',
    calendar_view_button_aria: 'Calendar View',
    list_view_button_aria: 'List View',
    more_options_button_aria: 'More',
    select_button_label: 'Select',
    cancel_selection_button_label: 'Cancel',
    delete_selected_button_label: 'Delete {count}',
    delete_selected_confirm_title: 'Delete Goals',
    delete_selected_confirm_message: 'The {count} selected goals will be permanently deleted.',
    days_left: '{count} days left',
    d_day: 'D-DAY',
    days_overdue: '{count} days overdue',

    // Calendar
    month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    day_names_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    day_names_long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    calendar_header_month_format: '{month} {year}',
    calendar_view_day3: '3-Day',
    calendar_view_week: 'Week',
    calendar_view_month: 'Month',

    // Modals & Alerts
    settings_title: 'Settings',
    sort_alert_title: 'Unable to Sort',
    sort_alert_message: 'Add at least two goals to use AI recommendations.',
    ai_sort_error_title: 'Sorting Unavailable',
    ai_sort_error_message: 'AI sorting is temporarily unavailable.',
    confirm_button: 'OK',
    new_goal_modal_title: 'New Goal',
    edit_goal_modal_title: 'Edit Goal',
    wish_label: 'Wish',
    outcome_label: 'Outcome',
    obstacle_label: 'Obstacle',
    plan_label: "If-Then Plan",
    deadline_label: 'Deadline',
    cancel_button: 'Cancel',
    add_button: 'Add',
    save_button: 'Save',
    goal_details_modal_title: 'Goal Details',
    ai_coach_suggestion: '🤖 AI Coach',
    ai_analyzing: 'AI Analyzing...',
    close_button: 'Close',
    ai_sort_reason_modal_title: 'Sort Reason',
    ai_sort_criteria: '🤖 Sort Criteria',
    delete_account_final_confirm_title: 'Delete Account',
    delete_account_final_confirm_message: 'Your account and all data (goals, folders, settings) will be permanently deleted. This action cannot be undone.',
    delete_all_data_button: 'Delete Account',
    settings_done_button: 'Done',
    settings_section_data: 'Data Management',
    settings_export_data: 'Export',
    settings_import_data: 'Import',
    import_confirm_title: 'Import Data',
    import_confirm_message: 'This will replace your current goals with new data. This action cannot be undone.',
    import_success_toast: 'Data imported successfully.',
    import_error_alert_title: 'Import Failed',
    import_error_alert_message: 'There was an error reading the file, or the file format is incorrect.',
    settings_section_general: 'General',
    settings_section_info: 'Information',
    settings_section_help: 'How to Use',
    settings_dark_mode: 'Dark Mode',
    settings_language: 'Language',
    settings_api_key: 'AI Assistant',
    settings_api_key_placeholder: 'Enter Gemini API key',
    settings_offline_mode: 'Offline Mode',
    settings_offline_mode_desc: 'Use basic features without AI',
    language_name: 'English (US)',
    language_modal_title: 'Language',
    settings_section_background: 'Appearance',
    settings_bg_default: 'Light',
    settings_bg_default_dark: 'Dark',
    settings_bg_pink: 'Pink',
    settings_bg_cherry_noir: 'Cherry Noir',
    settings_bg_blue: 'Blue',
    settings_bg_deep_ocean: 'Ocean',
    settings_bg_green: 'Green',
    settings_bg_forest_green: 'Forest',
    settings_bg_purple: 'Purple',
    settings_bg_royal_purple: 'Royal Purple',
    settings_section_account: 'Nova Beta Account',
    settings_sync_data: 'Sync Data',
    settings_load_data: 'Load Data',
    settings_logout: 'Sign Out',
    data_deleting: 'Deleting...',
    settings_version: 'Version',
    settings_developer: 'Developer',
    developer_name: 'GimGyuMin',
    settings_copyright: 'Copyright',
    copyright_notice: '© 2025 GimGyuMin. All Rights Reserved.',
    build_number: 'Build Number',
    settings_data_header: 'Data Management',
    settings_data_header_desc: 'Export or import your goal data.',
    settings_background_header: 'Background',
    settings_background_header_desc: "Change the app's background style to express your personality.",
    data_importing: 'Importing...',
    data_exporting: 'Exporting...',
    url_import_title: 'Load from URL',
    url_import_message: 'Overwrite current goals with data from the URL?',
    url_import_confirm: 'Load',
    url_import_success: 'Successfully loaded data from URL!',
    url_import_error: 'Invalid data in URL.',
    settings_share_link_header: 'Share via Link',
    settings_generate_link: 'Generate Share Link',
    settings_copy_link: 'Copy',
    link_copied_toast: 'Link copied to clipboard.',
    short_url_created: '📎 Short URL created successfully!',
    share_link_created: '🔗 Share link generated!',
    short_url_failed: '⚠️ Short URL creation failed, using default link.',
    no_data_to_share: 'No goals to share. Please add goals first.',

    // Usage Guide
    usage_guide_tab: 'How to Use',
    usage_guide_title: 'User Guide',
    usage_basic_title: 'Add a Goal',
    usage_basic_desc: '1. Tap "Add and Edit Goals" button on the home screen.\n2. Fill in your goal, outcome, obstacle, and plan in order.\n3. Select deadline and repeat days.\n4. Tap "Save" to add your goal.',
    usage_ai_title: 'Use AI Features',
    usage_ai_desc: '• Use "AI Suggestion" button when writing goals for improvements.\n• Tap "AI Sort" button to organize goals by importance.\n• Get AI analysis for more effective goal setting.\n\n※ API key setup is required to use AI features.',
    usage_ai_setup_title: 'Set Up AI Features',
    usage_ai_setup_desc: '1. Go to Settings > General and find the API Key field.\n2. Enter your Google Gemini API key.\n3. For API key generation, refer to the Google documentation:\n   https://ai.google.dev/gemini-api/docs/api-key\n4. AI features will be activated after entering the key.',
    usage_share_title: 'Share Your Goals',
    usage_share_desc: '1. Go to Settings > Sharing and tap "Create Goal Link".\n2. Review the automatically generated short link.\n3. Tap "Copy Link" to copy to clipboard.\n4. Share the link via messenger or email.',
    usage_theme_title: 'Change Theme',
    usage_theme_desc: '1. Go to Settings > Appearance and use the dark mode toggle.\n2. Select your preferred background theme.\n3. Choose from Default, Pink, Blue, Green, or Purple themes.\n4. Changes are applied immediately.',
    usage_calendar_title: 'Use Calendar View',
    usage_calendar_desc: '1. Tap the calendar icon in the bottom tabs.\n2. Choose between 3-day, weekly, or monthly view.\n3. Tap on any date to see goals for that day.\n4. Use left/right arrows to navigate dates.',
    usage_offline_title: 'Use Offline Mode',
    usage_offline_desc: '1. Go to Settings > General and turn on "Offline Mode".\n2. Add, edit, and delete goals without an API key.\n3. AI features are unavailable, but all basic functions work normally.\n4. Your data is safely stored in the browser.',
    
    // Goal Assistant
    goal_assistant_title: 'Add Goal',
    goal_assistant_mode_woop: 'WOOP',
    goal_assistant_mode_automation: 'Automation',
    automation_title: 'Goal Automation',
    automation_base_name_label: 'Base Goal Name',
    automation_base_name_placeholder: 'e.g., Study Vocabulary',
    automation_total_units_label: 'Total Units',
    automation_total_units_placeholder: 'e.g., 30',
    automation_units_per_day_label: 'Units per Day',
    automation_period_label: 'Period',
    automation_start_date_label: 'Start Date',
    automation_end_date_label: 'End Date',
    automation_generate_button: 'Generate {count}',
    automation_error_all_fields: 'Please fill out all fields correctly.',
    automation_error_start_after_end: 'Start date must be before end date.',
    automation_error_short_period: 'The period is too short (min. 1 day).',

    next_button: 'Next',
    back_button: 'Back',
    wish_tip: 'Set a challenging yet realistic goal. Make it specific and measurable.',
    wish_example: 'e.g., Lose 5kg in 3 months, Get an A+ this semester',
    outcome_tip: 'Imagine the most positive outcome of achieving your goal. The more vivid, the better.',
    outcome_example: 'e.g., Feeling healthier and more confident, Receiving a scholarship',
    obstacle_tip: 'What is the main internal obstacle (e.g., habits, emotions) that could stop you?',
    obstacle_example: 'e.g., Feeling too tired for the gym after work, Procrastinating on difficult tasks',
    plan_tip: "Create a specific plan to overcome your obstacle in an 'if-then' format.",
    plan_example: 'e.g., If I feel too tired for the gym after work, then I will change into my workout clothes and stretch for 10 minutes.',
    recurrence_label: 'Recurrence',
    recurrence_tip: 'Is this a goal you need to work on consistently? Set it as a recurring goal to track your streak.',
    recurrence_example: 'e.g., Go to the gym every Mon, Wed, Fri',
    recurrence_option_daily: 'Recurring Goal',
    deadline_tip: 'Set a realistic deadline to stay motivated. Long-term goals without a deadline are also fine.',
    deadline_option_no_deadline: 'No Deadline',
    day_names_short_picker: ["M", "T", "W", "T", "F", "S", "S"],
    settings_delete_account: 'Delete All Data',
    delete_account_header: 'Delete Data',
    delete_account_header_desc: 'This action is irreversible and will permanently delete all your goals and data.',
    version_update_title: "What's New",
    version_update_1_title: 'AI Assistant Setup',
    version_update_1_desc: 'Configure your Gemini API key directly or use offline mode to enjoy the app without AI features.',
    version_update_2_title: 'Goal Sharing',
    version_update_2_desc: 'Share your goals via links with short URL support. Perfect Unicode handling for all languages.',
    version_update_3_title: 'Modern Style UI',
    version_update_3_desc: 'Refined modern design language with mobile optimization for a more intuitive experience.',
  }
};

// --- 아이콘 객체 ---
const icons = {
    add: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    more: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    delete: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    close: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    back: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    forward: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    calendar: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    list: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    filter: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>,
    ai: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L14.34 8.66L20 11L14.34 13.34L12 19L9.66 13.34L4 11L9.66 8.66L12 3Z"/><path d="M5 21L7 16"/><path d="M19 21L17 16"/></svg>,
    flame: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>,
    data: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
    background: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>,
    account: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    infoCircle: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    help: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
    exclamation: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4h-2V7h2v6z"/></svg>,
    globe: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 1.53 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
};

// --- 유틸리티 함수 ---
const isSameDay = (date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const getRelativeTime = (deadline: string, t: (key: string) => string) => {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t('d_day');
  } else if (diffDays > 0) {
    return t('days_left').replace('{count}', String(diffDays));
  } else {
    return t('days_overdue').replace('{count}', String(Math.abs(diffDays)));
  }
};

const getStartOfWeek = (date: Date, startOfWeek = 1): Date => { // 0=Sun, 1=Mon
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day < startOfWeek ? 7 : 0) + day - startOfWeek;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- UTF-8 안전한 인코딩/디코딩 함수 ---
const utf8ToBase64 = (str: string): string => {
    try {
        // 한국어 등 UTF-8 문자를 안전하게 처리
        const encoded = new TextEncoder().encode(str);
        const binaryString = Array.from(encoded).map(byte => String.fromCharCode(byte)).join('');
        return btoa(binaryString);
    } catch (error) {
        console.error('UTF-8 to Base64 encoding failed:', error);
        return '';
    }
};

const base64ToUtf8 = (base64: string): string => {
    try {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (error) {
        console.error('Base64 to UTF-8 decoding failed:', error);
        return '';
    }
};

// --- 데이터 압축 및 URL 최적화 함수 ---
const compressDataForUrl = (data: any): string => {
    try {
        // JSON을 최대한 압축
        const jsonStr = JSON.stringify(data);
        
        // 불필요한 공백 제거
        const compressedJson = jsonStr.replace(/\s+/g, ' ').trim();
        
        // UTF-8 안전한 Base64 인코딩
        return utf8ToBase64(compressedJson);
    } catch (error) {
        console.error('Data compression failed:', error);
        return utf8ToBase64(JSON.stringify(data));
    }
};

// --- 단축 URL 생성 함수 (CORS 문제 해결) ---
const createShortUrl = async (longUrl: string): Promise<string> => {
    // URL이 너무 길지 않으면 그대로 사용
    if (longUrl.length < 1500) {
        return longUrl;
    }
    
    // URL 단축 기능을 간단하게 변경 - CORS 문제 해결을 위해 외부 API 사용 중단
    // 대신 URL이 너무 길 경우 사용자에게 알림을 제공
    const urlLength = longUrl.length;
    if (urlLength > 2000) {
        console.warn('⚠️ URL이 매우 깁니다. 일부 플랫폼에서 제한이 있을 수 있습니다.');
        // 긴 URL에 대한 사용자 친화적 처리
        return longUrl;
    }
    
    console.log('✅ URL 공유 준비 완료 (길이:', urlLength, '문자)');
    return longUrl;
};

// --- 배경화면 옵션 ---
const backgroundOptions = [
    { id: 'default', lightThemeClass: 'bg-solid-default', darkThemeClass: 'bg-solid-default', lightNameKey: 'settings_bg_default', darkNameKey: 'settings_bg_default_dark' },
    { id: 'pink', lightThemeClass: 'bg-solid-pink', darkThemeClass: 'bg-solid-pink', lightNameKey: 'settings_bg_pink', darkNameKey: 'settings_bg_cherry_noir' },
    { id: 'blue', lightThemeClass: 'bg-solid-blue', darkThemeClass: 'bg-solid-blue', lightNameKey: 'settings_bg_blue', darkNameKey: 'settings_bg_deep_ocean' },
    { id: 'green', lightThemeClass: 'bg-solid-green', darkThemeClass: 'bg-solid-green', lightNameKey: 'settings_bg_green', darkNameKey: 'settings_bg_forest_green' },
    { id: 'purple', lightThemeClass: 'bg-solid-purple', darkThemeClass: 'bg-solid-purple', lightNameKey: 'settings_bg_purple', darkNameKey: 'settings_bg_royal_purple' },
];

// --- 메인 앱 컴포넌트 ---
const App: React.FC<{}> = () => {
    // 기타 상태 (오류 방지용 기본값)
    const [activeUsers, setActiveUsers] = useState<any[]>([]);
    const [editingStates, setEditingStates] = useState<any>({});
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [userCategories, setUserCategories] = useState<string[]>(['school', 'work', 'personal', 'other']);
    // Goal Assistant Modal 상태
    const [isGoalAssistantOpen, setIsGoalAssistantOpen] = useState(false);
    // 상태 선언
    const [language, setLanguage] = useState('ko');
    // 사용자 정보 및 폴더 상태
    const [googleUser, setGoogleUser] = useState<any>(null);
    const [folders, setFolders] = useState<any[]>([]);
    const [todos, setTodos] = useState<Goal[]>([]);
    const [filter, setFilter] = useState('all');
    const [sortType, setSortType] = useState('manual');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
    const [backgroundTheme, setBackgroundTheme] = useState('default');
    const [isFolderCreateOpen, setIsFolderCreateOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Goal | null>(null);
    const [infoTodo, setInfoTodo] = useState<Goal | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isVersionInfoOpen, setIsVersionInfoOpen] = useState(false);
    const [isUsageGuideOpen, setIsUsageGuideOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedTodoIds, setSelectedTodoIds] = useState<Set<number>>(new Set());
    const [isViewModeCalendar, setIsViewModeCalendar] = useState(false);
    const [isAiSorting, setIsAiSorting] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [dataActionStatus, setDataActionStatus] = useState<'idle' | 'importing' | 'exporting' | 'deleting'>('idle');
    const [showPWAPrompt, setShowPWAPrompt] = useState(false);

    // 번역 함수 (string만 반환)
    const t = (key: string): string => {
        const value = translations[language as keyof typeof translations]?.[key as keyof typeof translations.ko];
        if (Array.isArray(value)) return value.join(', ');
        return value || key;
    };
    // GoogleGenAI 인스턴스 생성 함수
    const createAI = () => {
        if (!apiKey || isOfflineMode) return null;
        try {
            return new GoogleGenAI({ apiKey });
        } catch {
            return null;
        }
    };

    // 테마 모드 변경 핸들러
    const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
        setThemeMode(mode);
    };

    // 모든 데이터 삭제 핸들러
    const handleDeleteAllData = () => {
        setDataActionStatus('deleting');
        setTimeout(() => {
            setTodos([]);
            setToastMessage('모든 데이터가 삭제되었습니다.');
            setDataActionStatus('idle');
            setIsSettingsOpen(false);
        }, 1500);
    };

    // ...existing state, hooks, and logic...
    // (아래 기존 코드 그대로 유지)

    const encouragementMessages = useMemo(() => [
        t('empty_encouragement_1'),
        t('empty_encouragement_2'),
        t('empty_encouragement_3'),
        t('empty_encouragement_4'),
    ], [language]);

    const randomEncouragement = useMemo(() => encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)], [encouragementMessages]);

    useEffect(() => {
        const savedTodos = localStorage.getItem('nova-todos');
        const savedDarkMode = localStorage.getItem('nova-dark-mode');
        const savedBackground = localStorage.getItem('nova-background');
        const savedSortType = localStorage.getItem('nova-sort-type');

        if (savedTodos) {
            const parsedTodos: Goal[] = JSON.parse(savedTodos);
            const today = new Date().toISOString();
            const updatedTodos = parsedTodos.map(todo => {
                if (todo.isRecurring && todo.lastCompletedDate && !isSameDay(today, todo.lastCompletedDate)) {
                    return { ...todo, completed: false };
                }
                return todo;
            });
            setTodos(updatedTodos);
        }
        if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));
        if (savedBackground) setBackgroundTheme(savedBackground);
        if (savedSortType) setSortType(savedSortType);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const dataFromUrl = urlParams.get('data');
        if (dataFromUrl) {
            try {
                const decodedJson = base64ToUtf8(dataFromUrl);
                const importedTodos = JSON.parse(decodedJson);
                if (Array.isArray(importedTodos) && (importedTodos.length === 0 || ('wish' in importedTodos[0] && 'id' in importedTodos[0]))) {
                    setAlertConfig({
                        title: t('url_import_title'),
                        message: t('url_import_message'),
                        confirmText: t('url_import_confirm'),
                        cancelText: t('cancel_button'),
                        onConfirm: () => {
                            setTodos(importedTodos);
                            setToastMessage(t('url_import_success') as string);
                            window.history.replaceState({}, document.title, window.location.pathname);
                        },
                        onCancel: () => {
                             window.history.replaceState({}, document.title, window.location.pathname);
                        }
                    });
                } else { throw new Error("Invalid data format"); }
            } catch (e) {
                console.error("Failed to parse data from URL", e);
                setAlertConfig({ title: t('import_error_alert_title'), message: t('url_import_error') });
                 window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [t]);

    
    // 시스템 다크모드 감지 및 적용
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleThemeChange = (e: MediaQueryListEvent) => {
            if (themeMode === 'system') {
                setIsDarkMode(e.matches);
            }
        };

        // 테마 모드 변경 시 적용
        if (themeMode === 'system') {
            setIsDarkMode(mediaQuery.matches);
        } else {
            setIsDarkMode(themeMode === 'dark');
        }

        mediaQuery.addEventListener('change', handleThemeChange);
        return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }, [themeMode]);

    // PWA 설치 프롬프트 표시 로직
    useEffect(() => {
        const checkPWAPrompt = () => {
            const isDismissed = localStorage.getItem('pwa-prompt-dismissed');
            const isMobileDevice = isMobile();
            const isInStandalone = isStandalone();
            
            if (isMobileDevice && !isInStandalone && !isDismissed) {
                // 첫 방문 후 3초 뒤에 프롬프트 표시
                const timer = setTimeout(() => {
                    setShowPWAPrompt(true);
                }, 3000);
                
                return () => clearTimeout(timer);
            }
        };

        checkPWAPrompt();
    }, []);

    // Service Worker 등록
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/Nova-AI-Planer/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }, []);

    // 테마 설정 저장 및 다크모드 상태 저장 수정
    useEffect(() => { 
        localStorage.setItem('nova-theme', themeMode); 
        localStorage.setItem('nova-dark-mode', JSON.stringify(isDarkMode)); 
    }, [themeMode, isDarkMode]);

    useEffect(() => { localStorage.setItem('nova-lang', language); }, [language]);
    useEffect(() => { localStorage.setItem('nova-todos', JSON.stringify(todos)); }, [todos]);
    useEffect(() => { localStorage.setItem('nova-api-key', apiKey); }, [apiKey]);
    useEffect(() => { localStorage.setItem('nova-offline-mode', String(isOfflineMode)); }, [isOfflineMode]);

    useEffect(() => {
        const selectedTheme = backgroundOptions.find(opt => opt.id === backgroundTheme) || backgroundOptions[0];
        const themeClass = isDarkMode ? selectedTheme.darkThemeClass : selectedTheme.lightThemeClass;
        
        document.body.className = ''; // Reset classes
        if (isDarkMode) document.body.classList.add('dark-mode');
        if (themeClass) document.body.classList.add(themeClass);
        
        localStorage.setItem('nova-background', backgroundTheme);
    }, [backgroundTheme, isDarkMode]);

    useEffect(() => { localStorage.setItem('nova-sort-type', sortType); }, [sortType]);
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const filteredTodos = useMemo(() => {
        let sortedTodos = [...todos];
        

// 연구용 자기 성찰 기록지 분리 렌더링 (해시 #research-log)
if (window.location.hash === '#research-log') {
    import('./ResearchReflectionForm').then(({ default: ResearchReflectionForm }) => {
        const root = document.getElementById('root');
        if (root) {
            root.style.background = 'var(--modal-backdrop-color)';
            root.style.display = 'flex';
            root.style.justifyContent = 'center';
            root.style.alignItems = 'center';
            ReactDOM.createRoot(root).render(
                <div className="modal-backdrop">
                    <div className="modal-content" style={{ maxWidth: 420, width: '100%' }}>
                        <ResearchReflectionForm />
                    </div>
                </div>
            );
        }
    });
} else {
    // 기존 앱 렌더링 코드 내부에 연구용 진입 버튼 추가
    function ResearchAccessButton() {
        const [showModal, setShowModal] = useState(false);
        const [input, setInput] = useState('');
        const [error, setError] = useState('');
        const handleOpen = () => setShowModal(true);
        const handleClose = () => { setShowModal(false); setInput(''); setError(''); };
        const handleChange = (e) => setInput(e.target.value);
        const handleSubmit = (e) => {
            e.preventDefault();
            if (input === '1010') {
                window.location.hash = '#research-log';
                setShowModal(false);
            } else {
                setError('암호가 올바르지 않습니다.');
            }
        };
        return (
            <>
                <button className="header-action-button" style={{ marginLeft: 8 }} onClick={handleOpen}>연구용 기록지</button>
                {showModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content modal-content-small">
                            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                                <h3 style={{ marginBottom: 16 }}>연구용 기록지 접속</h3>
                                <input type="password" autoFocus placeholder="암호 입력" value={input} onChange={handleChange} style={{ marginBottom: 12 }} />
                                {error && <div className="error-message">{error}</div>}
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button type="submit" className="header-action-button" style={{ flex: 1, background: 'var(--primary-color)', color: '#fff' }}>확인</button>
                                    <button type="button" className="header-action-button" style={{ flex: 1 }} onClick={handleClose}>취소</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }
    // 기존 앱 렌더링 코드 예시 (root에 렌더)
    const root = document.getElementById('root');
    if (root) {
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
}
        if (sortType === 'deadline') {
            sortedTodos.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });
        } else if (sortType === 'newest') {
            sortedTodos.sort((a, b) => b.id - a.id);
        } else if (sortType === 'alphabetical') {
            sortedTodos.sort((a, b) => a.wish.localeCompare(b.wish));
        }

        if (filter === 'active') return sortedTodos.filter(todo => !todo.completed);
        if (filter === 'completed') return sortedTodos.filter(todo => todo.completed);
        return sortedTodos;
    }, [todos, filter, sortType]);
    
    const handleAddTodo = (newTodoData: Omit<Goal, 'id' | 'completed' | 'lastCompletedDate' | 'streak'>) => {
        const newTodo: Goal = { ...newTodoData, id: Date.now(), completed: false, lastCompletedDate: null, streak: 0 };
        setTodos(prev => [newTodo, ...prev]);
    setIsGoalAssistantOpen(false);
    };
    
    const handleAddMultipleTodos = (newTodosData: Omit<Goal, 'id' | 'completed' | 'lastCompletedDate' | 'streak'>[]) => {
        const newTodos: Goal[] = newTodosData.map((goalData, index) => ({
            ...goalData,
            id: Date.now() + index,
            completed: false,
            lastCompletedDate: null,
            streak: 0,
        })).reverse(); // So the first goal appears at the top
        setTodos(prev => [...newTodos, ...prev]);
    setIsGoalAssistantOpen(false);
    };

    const handleEditTodo = (updatedTodo: Goal) => {
        setTodos(todos.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo)));
        setEditingTodo(null);
    };

    const handleDeleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggleComplete = (id: number) => {
        const today = new Date().toISOString();
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                const isCompleted = !todo.completed;
                let newStreak = todo.streak;
                if (todo.isRecurring) {
                    if (isCompleted) {
                        if (!todo.lastCompletedDate || !isSameDay(today, todo.lastCompletedDate)) {
                            newStreak = (todo.streak || 0) + 1;
                        }
                    } else {
                        if (todo.lastCompletedDate && isSameDay(today, todo.lastCompletedDate)) {
                            newStreak = Math.max(0, (todo.streak || 1) - 1);
                        }
                    }
                }
                return { ...todo, completed: isCompleted, lastCompletedDate: isCompleted ? today : todo.lastCompletedDate, streak: newStreak };
            }
            return todo;
        }));
    };
    
    const handleSort = async (type: string) => {
        if (type === 'ai') {
            if (todos.length < 2) {
                setAlertConfig({ title: t('sort_alert_title'), message: t('sort_alert_message') });
                return;
            }
            setIsAiSorting(true);
            try {
                const ai = createAI();
                if (!ai) {
                    setToastMessage(isOfflineMode ? '오프라인 모드에서는 AI 정렬을 사용할 수 없습니다.' : 'AI 정렬을 사용하려면 설정에서 API 키를 입력해주세요.');
                    setIsAiSorting(false);
                    setSortType('manual');
                    return;
                }
                
                const prompt = `Here is a list of goals with their details (wish, outcome, obstacle, plan, deadline). Prioritize them based on urgency (closer deadline), importance (based on outcome), and feasibility (based on plan). Return a JSON object with a single key "sorted_ids" which is an array of the goal IDs in the recommended order. Do not include any other text or explanations. Goals: ${JSON.stringify(todos.map(({ id, wish, outcome, obstacle, plan, deadline }) => ({ id, wish, outcome, obstacle, plan, deadline })))}`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { sorted_ids: { type: Type.ARRAY, items: { type: Type.NUMBER } } } } }
                });
                
                const resultJson = JSON.parse(response.text);
                const sortedIds: number[] = resultJson.sorted_ids.map(Number);
                const todoMap = new Map(todos.map(todo => [Number(todo.id), todo]));
                const sortedTodos = sortedIds.map(id => todoMap.get(id)).filter(Boolean) as Goal[];
                const unsortedTodos = todos.filter(todo => !sortedIds.includes(Number(todo.id)));
                const finalSortedTodos = [...sortedTodos, ...unsortedTodos].map(todo => ({ ...todo, id: Number(todo.id) }));

                setTodos(finalSortedTodos);
                setSortType('manual');
            } catch (error) {
                console.error("AI sort failed:", error);
                setAlertConfig({ title: t('ai_sort_error_title'), message: t('ai_sort_error_message') });
            } finally {
                setIsAiSorting(false);
            }
        } else {
            setSortType(type);
        }
    };
    
    const handleSelectTodo = (id: number) => {
        const newSelectedIds = new Set(selectedTodoIds);
        if (newSelectedIds.has(id)) newSelectedIds.delete(id);
        else newSelectedIds.add(id);
        setSelectedTodoIds(newSelectedIds);
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedTodoIds(new Set());
    };

    const handleDeleteSelected = () => {
        const count = selectedTodoIds.size;
        setAlertConfig({
            title: t('delete_selected_confirm_title'),
            message: (typeof t('delete_selected_confirm_message') === 'string' ? t('delete_selected_confirm_message') : '').replace('{count}', String(count)),
            isDestructive: true,
            confirmText: (typeof t('delete_selected_button_label') === 'string' ? t('delete_selected_button_label') : '').replace('{count}', String(count)),
            cancelText: t('cancel_button'),
            onConfirm: () => {
                setTodos(todos.filter(todo => !selectedTodoIds.has(todo.id)));
                handleCancelSelection();
            }
        });
    };
    
    const handleExportData = () => {
        setDataActionStatus('exporting');
        const dataStr = JSON.stringify(todos, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'nova_goals.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setTimeout(() => {
            setDataActionStatus('idle');
            setIsSettingsOpen(false);
        }, 1500);
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string");
                const importedTodos = JSON.parse(text);
                if (Array.isArray(importedTodos) && importedTodos.every(item => 'wish' in item && 'id' in item)) {
                     setAlertConfig({
                        title: t('import_confirm_title'),
                        message: t('import_confirm_message'),
                        confirmText: t('settings_import_data'),
                        cancelText: t('cancel_button'),
                        onConfirm: () => {
                            setDataActionStatus('importing');
                            setTimeout(() => {
                                setTodos(importedTodos);
                                setToastMessage(t('import_success_toast') as string);
                                setDataActionStatus('idle');
                                setIsSettingsOpen(false);
                            }, 1500);
                        }
                    });
                } else { throw new Error("Invalid file format"); }
            } catch (error) {
                 setAlertConfig({ title: t('import_error_alert_title'), message: t('import_error_alert_message') });
            }
        };
        reader.onerror = () => setAlertConfig({ title: t('import_error_alert_title'), message: t('import_error_alert_message') });
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleDeleteAccount = () => {
        // 계정 삭제 확인 대화상자
        setAlertConfig({
            title: '⚠️ 계정 삭제',
            message: '정말로 계정과 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다:\n\n• 계정 및 모든 목표, 폴더, 설정, 협업 정보\n• Firebase 클라우드 데이터\n• 로컬 설정 및 공유 폴더 데이터',
            confirmText: '계정 완전 삭제',
            cancelText: '취소',
            isDestructive: true,
            onConfirm: async () => {
                setAlertConfig(null);
                try {
                    await performDeleteAccount();
                    setTimeout(() => {
                        if (typeof window !== 'undefined') window.location.reload();
                    }, 2000);
                } catch (e) {
                    setAlertConfig({
                        title: '❌ 계정 삭제 실패',
                        message: '계정 삭제 중 오류가 발생했습니다.\n\n' + (e instanceof Error ? e.message : ''),
                        confirmText: '확인',
                        onConfirm: () => setAlertConfig(null)
                    });
                }
            },
            onCancel: () => {
                setAlertConfig(null);
            }
        });
    };

    const performDeleteAccount = async () => {
        console.log('🗑️ performDeleteAccount 함수 시작');
        setDataActionStatus('deleting');
        try {
            // 1. Firebase 사용자 데이터 삭제 (REST API fetch 병행)
            if (googleUser) {
                console.log('📧 사용자 정보:', { uid: googleUser.uid, email: googleUser.email });
                console.log('🗑️ Firebase 데이터 삭제 시작...');

                // Firestore REST API fetch 래퍼 import
                // firestoreFetch는 정적 import로 대체됨
                const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
                // 백업 데이터 삭제 (users/{uid}/data/todos, settings)
                try {
                    await firestoreFetch(`/users/${googleUser.uid}/data/todos`, { method: 'DELETE' });
                    console.log('✅ REST todos 문서 삭제 완료');
                } catch (dataError) {
                    console.warn('⚠️ REST todos 문서 삭제 실패:', dataError);
                }
                try {
                    await firestoreFetch(`/users/${googleUser.uid}/data/settings`, { method: 'DELETE' });
                    console.log('✅ REST settings 문서 삭제 완료');
                } catch (settingsError) {
                    console.warn('⚠️ REST settings 문서 삭제 실패:', settingsError);
                }
                // 개별 목표 컬렉션 삭제 (users/{uid}/todos)
                try {
                    const todosList = await firestoreFetch(`/users/${googleUser.uid}/todos`, { method: 'GET' });
                    if (todosList.documents) {
                        await Promise.all(
                            todosList.documents.map((doc: any) => firestoreFetch(`/users/${googleUser.uid}/todos/${doc.name.split('/').pop()}`, { method: 'DELETE' }))
                        );
                    }
                    console.log('✅ REST todos 컬렉션 삭제 완료');
                } catch (todosError) {
                    console.warn('⚠️ REST todos 컬렉션 삭제 실패:', todosError);
                }
                // 개별 폴더 컬렉션 삭제 (users/{uid}/folders)
                try {
                    const foldersList = await firestoreFetch(`/users/${googleUser.uid}/folders`, { method: 'GET' });
                    if (foldersList.documents) {
                        await Promise.all(
                            foldersList.documents.map((doc: any) => firestoreFetch(`/users/${googleUser.uid}/folders/${doc.name.split('/').pop()}`, { method: 'DELETE' }))
                        );
                    }
                    console.log('✅ REST folders 컬렉션 삭제 완료');
                } catch (foldersError) {
                    console.warn('⚠️ REST folders 컬렉션 삭제 실패:', foldersError);
                }
                // 사용자 프로필 문서 삭제 (users/{uid})
                try {
                    await firestoreFetch(`/users/${googleUser.uid}`, { method: 'DELETE' });
                    console.log('✅ REST 사용자 프로필 문서 삭제 완료');
                } catch (userDocError) {
                    console.warn('⚠️ REST 사용자 프로필 문서 삭제 실패:', userDocError);
                }

                // 공유 폴더에서 내가 참여한 데이터 정리
                const sharedFoldersRef = collection(db, 'sharedFolders');
                const sharedSnapshot = await getDocs(sharedFoldersRef);
                for (const doc of sharedSnapshot.docs) {
                    const data = doc.data();
                    if (data.collaborators && Array.isArray(data.collaborators)) {
                        const filteredCollaborators = data.collaborators.filter(
                            (collab: any) => collab.userId !== googleUser.uid
                        );
                        if (filteredCollaborators.length !== data.collaborators.length) {
                            await updateDoc(doc.ref, { collaborators: filteredCollaborators });
                            console.log('✅ 공유 폴더에서 내 계정 제거:', doc.id);
                        }
                    }
                }

                // presence 데이터 삭제
                try {
                    for (const folder of folders) {
                        if (folder.id) {
                            const presenceRef = doc(db, 'folderPresence', folder.id, 'users', googleUser.uid);
                            await deleteDoc(presenceRef);
                        }
                    }
                    console.log('✅ presence 데이터 삭제 완료');
                } catch (presenceError) {
                    console.warn('⚠️ presence 데이터 삭제 중 일부 오류:', presenceError);
                }

                // editing states 삭제
                try {
                    const editingQuery = query(collection(db, 'folderEditing'), where('userId', '==', googleUser.uid));
                    const editingSnapshot = await getDocs(editingQuery);
                    const deleteEditingPromises = editingSnapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deleteEditingPromises);
                    console.log('✅ editing states 삭제 완료');
                } catch (editingError) {
                    console.warn('⚠️ editing states 삭제 중 일부 오류:', editingError);
                }

                // 사용자 프로필 데이터 삭제 (users/{uid} 문서)
                try {
                    const userDocRef = doc(db, 'users', googleUser.uid);
                    await deleteDoc(userDocRef);
                    console.log('✅ 사용자 프로필 문서 삭제 완료');
                } catch (userDocError) {
                    console.warn('⚠️ 사용자 프로필 문서 삭제 실패:', userDocError);
                }

                // 알림 데이터 삭제 (notifications/{uid})
                try {
                    const notificationsRef = collection(db, 'notifications', googleUser.uid, 'items');
                    const notificationsSnapshot = await getDocs(notificationsRef);
                    const deleteNotificationPromises = notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deleteNotificationPromises);
                    
                    // 알림 컬렉션 루트 문서도 삭제
                    const notificationRootRef = doc(db, 'notifications', googleUser.uid);
                    await deleteDoc(notificationRootRef);
                    console.log('✅ 알림 데이터 삭제 완료');
                } catch (notificationError) {
                    console.warn('⚠️ 알림 데이터 삭제 중 일부 오류:', notificationError);
                }

                // 사용자 활동 로그 삭제 (userActivity/{uid})
                try {
                    const activityRef = collection(db, 'userActivity', googleUser.uid, 'logs');
                    const activitySnapshot = await getDocs(activityRef);
                    const deleteActivityPromises = activitySnapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deleteActivityPromises);
                    
                    // 활동 로그 루트 문서도 삭제
                    const activityRootRef = doc(db, 'userActivity', googleUser.uid);
                    await deleteDoc(activityRootRef);
                    console.log('✅ 사용자 활동 로그 삭제 완료');
                } catch (activityError) {
                    console.warn('⚠️ 사용자 활동 로그 삭제 중 일부 오류:', activityError);
                }

                // 사용자 메타데이터 삭제 (userMetadata/{uid})
                try {
                    const metadataRef = doc(db, 'userMetadata', googleUser.uid);
                    await deleteDoc(metadataRef);
                    console.log('✅ 사용자 메타데이터 삭제 완료');
                } catch (metadataError) {
                    console.warn('⚠️ 사용자 메타데이터 삭제 중 일부 오류:', metadataError);
                }

                // 사용자 세션 데이터 삭제 (userSessions/{uid})
                try {
                    const sessionRef = doc(db, 'userSessions', googleUser.uid);
                    await deleteDoc(sessionRef);
                    console.log('✅ 사용자 세션 데이터 삭제 완료');
                } catch (sessionError) {
                    console.warn('⚠️ 사용자 세션 데이터 삭제 중 일부 오류:', sessionError);
                }

                console.log('🔥 모든 클라우드 데이터 삭제 완료 - 사용자 데이터가 완전히 제거되었습니다');
            }

            // 2. 로컬 상태 완전 초기화
            console.log('🔄 로컬 상태 초기화 시작...');
            setTodos([]);
            setFolders([]);
            setActiveUsers([]);
            setEditingStates({});
            setConflicts([]);
            setCurrentFolderId(null);
            setSelectedTodoIds(new Set());
            setIsSelectionMode(false);
            setFilter('all');
            setCategoryFilter('all');
            
            // 3. 설정 완전 초기화
            console.log('⚙️ 설정 초기화 시작...');
            setLanguage('ko');
            setIsDarkMode(true);
            setBackgroundTheme('default');
            setSortType('manual');
            setUserCategories(['school', 'work', 'personal', 'other']);
            
            // 4. localStorage 완전 삭제
            console.log('💾 localStorage 초기화 시작...');
            localStorage.clear();
            console.log('✅ localStorage 완전 삭제 완료');
            
            // 5. Firebase 계정 삭제
            if (googleUser) {
                try {
                    await googleUser.delete();
                    console.log('✅ Firebase 계정 삭제 완료');
                } catch (deleteError) {
                    // 만료된 세션 등으로 삭제 실패 시 재인증 안내
                    if (deleteError.code === 'auth/requires-recent-login') {
                        setAlertConfig({
                            title: '재로그인 필요',
                            message: '계정 삭제를 위해 다시 로그인해야 합니다.\n로그아웃 후 재로그인 후 다시 시도해주세요.',
                            confirmText: '확인',
                            onConfirm: () => setAlertConfig(null)
                        });
                    }
                    throw deleteError;
                }
            }
            console.log('✅ 계정 및 모든 데이터 삭제 완료');
            setToastMessage('✅ 계정이 완전히 삭제되었습니다.');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('❌ 데이터 삭제 중 오류:', error);
            
            // 구체적인 오류 타입에 따른 사용자 친화적 메시지
            let errorTitle = '❌ 삭제 실패';
            let errorMessage = '데이터 삭제 중 오류가 발생했습니다.';
            
            if (error instanceof Error) {
                if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
                    errorTitle = '❌ 권한 부족';
                    errorMessage = '삭제 권한이 부족합니다.\n\n잠시 후 다시 시도해주세요.\n(Firebase 보안 규칙이 업데이트 중일 수 있습니다)';
                } else if (error.message.includes('network-request-failed')) {
                    errorTitle = '❌ 네트워크 오류';
                    errorMessage = '인터넷 연결을 확인하고 다시 시도해주세요.';
                } else if (error.message.includes('unauthenticated')) {
                    errorTitle = '❌ 로그인 필요';
                    errorMessage = '로그인이 만료되었습니다.\n다시 로그인해주세요.';
                } else {
                    errorMessage = '데이터 삭제 중 오류가 발생했습니다.\n\n오류 내용: ' + error.message;
                }
            }
            
            // Alert 팝업으로 오류 표시
            setAlertConfig({
                title: errorTitle,
                message: errorMessage,
                confirmText: '확인',
                onConfirm: () => setAlertConfig(null)
            });
        } finally {
            setDataActionStatus('idle');
            setIsSettingsOpen(false);
        }
    };

    const isAnyModalOpen = isGoalAssistantOpen || !!editingTodo || !!infoTodo || isSettingsOpen || !!alertConfig || isVersionInfoOpen || isUsageGuideOpen;

    return (
        <div className={`main-page-layout ${isViewModeCalendar ? 'calendar-view-active' : ''}`}>
            <div className={`page-content ${isAnyModalOpen ? 'modal-open' : ''}`}>
                <div className="container">
                    <Header 
                        t={t} 
                        isSelectionMode={isSelectionMode} 
                        selectedCount={selectedTodoIds.size} 
                        onCancelSelection={handleCancelSelection} 
                        onDeleteSelected={handleDeleteSelected} 
                        isViewModeCalendar={isViewModeCalendar} 
                        onToggleViewMode={() => setIsViewModeCalendar(!isViewModeCalendar)} 
                        isAiSorting={isAiSorting} 
                        sortType={sortType} 
                        onSort={handleSort} 
                        filter={filter} 
                        onFilter={setFilter} 
                        onSetSelectionMode={() => setIsSelectionMode(true)}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onAddGoal={() => setIsGoalAssistantOpen(true)}
                    />
                    {isViewModeCalendar ? (
                        <CalendarView todos={todos} t={t} onGoalClick={setInfoTodo} language={language} />
                    ) : (
                        <TodoList todos={filteredTodos} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTodo} onEdit={setEditingTodo} onInfo={setInfoTodo} t={t} filter={filter} randomEncouragement={randomEncouragement as string} isSelectionMode={isSelectionMode} selectedTodoIds={selectedTodoIds} onSelectTodo={handleSelectTodo} />
                    )}
                </div>
            </div>

            {isGoalAssistantOpen && <GoalAssistantModal onClose={() => setIsGoalAssistantOpen(false)} onAddTodo={handleAddTodo} onAddMultipleTodos={handleAddMultipleTodos} t={t} language={language} createAI={createAI} />}
            {editingTodo && <GoalAssistantModal onClose={() => setEditingTodo(null)} onEditTodo={handleEditTodo} existingTodo={editingTodo} t={t} language={language} createAI={createAI} />}
            {infoTodo && <GoalInfoModal todo={infoTodo} onClose={() => setInfoTodo(null)} t={t} createAI={createAI} />}
            {isSettingsOpen && <SettingsModal 
                onClose={() => setIsSettingsOpen(false)} 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                themeMode={themeMode}
                onThemeChange={handleThemeChange}
                backgroundTheme={backgroundTheme} 
                onSetBackgroundTheme={setBackgroundTheme} 
                onExportData={handleExportData} 
                onImportData={handleImportData} 
                setAlertConfig={setAlertConfig} 
                onDeleteAllData={handleDeleteAllData}
                dataActionStatus={dataActionStatus} 
                language={language} 
                onSetLanguage={setLanguage} 
                t={t} 
                todos={todos} 
                setToastMessage={setToastMessage} 
                onOpenVersionInfo={() => setIsVersionInfoOpen(true)} 
                onOpenUsageGuide={() => setIsUsageGuideOpen(true)} 
                apiKey={apiKey} 
                onSetApiKey={setApiKey} 
                isOfflineMode={isOfflineMode} 
                onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)} 
            />}
            {isVersionInfoOpen && <VersionInfoModal onClose={() => setIsVersionInfoOpen(false)} t={t} />}
            {isUsageGuideOpen && <UsageGuideModal onClose={() => setIsUsageGuideOpen(false)} t={t} />}
            {alertConfig && <AlertModal title={alertConfig.title} message={alertConfig.message} onConfirm={() => { alertConfig.onConfirm?.(); setAlertConfig(null); }} onCancel={alertConfig.onCancel ? () => { alertConfig.onCancel?.(); setAlertConfig(null); } : undefined} confirmText={alertConfig.confirmText} cancelText={alertConfig.cancelText} isDestructive={alertConfig.isDestructive} t={t} />}
            {toastMessage && <div className="toast-notification">{toastMessage}</div>}
            {showPWAPrompt && <PWAInstallPrompt onClose={() => setShowPWAPrompt(false)} />}
        </div>
    );
};

// --- ReactDOM 렌더링 ---
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}

const Header: React.FC<{ t: (key: string) => any; isSelectionMode: boolean; selectedCount: number; onCancelSelection: () => void; onDeleteSelected: () => void; isViewModeCalendar: boolean; onToggleViewMode: () => void; isAiSorting: boolean; sortType: string; onSort: (type: string) => void; filter: string; onFilter: (type: string) => void; onSetSelectionMode: () => void; onOpenSettings: () => void; onAddGoal: () => void; }> = ({ t, isSelectionMode, selectedCount, onCancelSelection, onDeleteSelected, isViewModeCalendar, onToggleViewMode, isAiSorting, sortType, onSort, filter, onFilter, onSetSelectionMode, onOpenSettings, onAddGoal }) => {
    const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

    useEffect(() => {
        const closePopovers = () => {
            setIsFilterPopoverOpen(false);
        };
        document.addEventListener('click', closePopovers);
        document.addEventListener('touchstart', closePopovers);
        return () => {
            document.removeEventListener('click', closePopovers);
            document.removeEventListener('touchstart', closePopovers);
        };
    }, []);

    const toggleFilterPopover = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsFilterPopoverOpen(prev => !prev);
    };

    const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
    };


    return (
        <header>
            <div className="header-left">
                {isSelectionMode && <button onClick={onCancelSelection} className="header-action-button">{t('cancel_selection_button_label')}</button>}
            </div>
            <div className="header-title-group">
                <h1>{t('my_goals_title')}</h1>
                {!isSelectionMode && (
                    <div className="header-inline-actions">
                        <button onClick={onToggleViewMode} className="header-icon-button" aria-label={isViewModeCalendar ? t('list_view_button_aria') : t('calendar_view_button_aria')}>{isViewModeCalendar ? icons.list : icons.calendar}</button>
                        <div className="filter-sort-container">
                            <button onClick={toggleFilterPopover} onTouchStart={toggleFilterPopover} className="header-icon-button" aria-label={t('filter_sort_button_aria')}>{isAiSorting ? <div className="spinner" /> : icons.filter}</button>
                            {isFilterPopoverOpen && (
                                <div className="profile-popover filter-sort-popover" onClick={stopPropagation} onTouchStart={stopPropagation}>
                                    <div className="popover-section">
                                        <button onClick={() => { onSetSelectionMode(); setIsFilterPopoverOpen(false); }} className="popover-action-button"><span>{t('select_button_label')}</span></button>
                                    </div>
                                    <div className="popover-section">
                                        <h4>{t('filter_title')}</h4>
                                        <button onClick={() => { onFilter('all'); }} className={`popover-action-button ${filter === 'all' ? 'active' : ''}`}><span>{t('filter_all')}</span>{filter === 'all' && icons.check}</button>
                                        <button onClick={() => { onFilter('active'); }} className={`popover-action-button ${filter === 'active' ? 'active' : ''}`}><span>{t('filter_active')}</span>{filter === 'active' && icons.check}</button>
                                        <button onClick={() => { onFilter('completed'); }} className={`popover-action-button ${filter === 'completed' ? 'active' : ''}`}><span>{t('filter_completed')}</span>{filter === 'completed' && icons.check}</button>
                                    </div>
                                    <div className="popover-section">
                                        <h4>{t('sort_title')}</h4>
                                        <button onClick={() => { onSort('manual'); }} className={`popover-action-button ${sortType === 'manual' ? 'active' : ''}`}><span>{t('sort_label_manual')}</span>{sortType === 'manual' && icons.check}</button>
                                        <button onClick={() => { onSort('deadline'); }} className={`popover-action-button ${sortType === 'deadline' ? 'active' : ''}`}><span>{t('sort_label_deadline')}</span>{sortType === 'deadline' && icons.check}</button>
                                        <button onClick={() => { onSort('newest'); }} className={`popover-action-button ${sortType === 'newest' ? 'active' : ''}`}><span>{t('sort_label_newest')}</span>{sortType === 'newest' && icons.check}</button>
                                        <button onClick={() => { onSort('alphabetical'); }} className={`popover-action-button ${sortType === 'alphabetical' ? 'active' : ''}`}><span>{t('sort_label_alphabetical')}</span>{sortType === 'alphabetical' && icons.check}</button>
                                        <button onClick={() => { onSort('ai'); }} className="popover-action-button with-icon"><span className="popover-button-icon">{icons.ai}</span><span>{isAiSorting ? t('ai_sorting_button') : t('sort_label_ai')}</span></button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={onOpenSettings} className="header-icon-button" aria-label={t('settings_title')}>{icons.settings}</button>
                    </div>
                )}
            </div>
            <div className="header-right">
                {isSelectionMode ? (
                    <button onClick={onDeleteSelected} className="header-action-button destructive">{t('delete_selected_button_label').replace('{count}', String(selectedCount))}</button>
                ) : (
                    <button onClick={onAddGoal} className="header-icon-button" aria-label={t('add_new_goal_button_label')}>{icons.add}</button>
                )}
            </div>
        </header>
    );
};

const TodoList: React.FC<{ todos: Goal[]; onToggleComplete: (id: number) => void; onDelete: (id: number) => void; onEdit: (todo: Goal) => void; onInfo: (todo: Goal) => void; t: (key: string) => any; filter: string; randomEncouragement: string; isSelectionMode: boolean; selectedTodoIds: Set<number>; onSelectTodo: (id: number) => void; }> = ({ todos, onToggleComplete, onDelete, onEdit, onInfo, t, filter, randomEncouragement, isSelectionMode, selectedTodoIds, onSelectTodo }) => {
    if (todos.length === 0) {
        const messageKey = `empty_message_${filter}`;
        return <div className="empty-message"><p>{t(messageKey)}</p>{filter === 'all' && <span>{randomEncouragement}</span>}</div>;
    }
    return <ul>{todos.map(todo => <TodoItem key={todo.id} todo={todo} onToggleComplete={onToggleComplete} onDelete={onDelete} onEdit={onEdit} onInfo={onInfo} t={t} isSelectionMode={isSelectionMode} isSelected={selectedTodoIds.has(todo.id)} onSelect={onSelectTodo} />)}</ul>;
};

const TodoItem: React.FC<{ todo: Goal; onToggleComplete: (id: number) => void; onDelete: (id: number) => void; onEdit: (todo: Goal) => void; onInfo: (todo: Goal) => void; t: (key: string) => any; isSelectionMode: boolean; isSelected: boolean; onSelect: (id: number) => void; }> = React.memo(({ todo, onToggleComplete, onDelete, onEdit, onInfo, t, isSelectionMode, isSelected, onSelect }) => {
    const handleItemClick = () => { if (isSelectionMode) onSelect(todo.id); };
    return (
        <li className={`${todo.completed ? 'completed' : ''} ${isSelectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`} onClick={handleItemClick}>
            <div className="swipeable-content">
                <label className="checkbox-container" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={todo.completed} onChange={() => onToggleComplete(todo.id)} /><span className="checkmark"></span></label>
                <div className="todo-text-with-streak"><span className="todo-text">{todo.wish}</span>{todo.isRecurring && todo.streak > 0 && <div className="streak-indicator">{icons.flame}<span>{todo.streak}</span></div>}</div>
                <div className="todo-actions-and-meta">
                    <div className="todo-meta-badges">{todo.deadline && <span className="todo-deadline">{getRelativeTime(todo.deadline, t)}</span>}</div>
                    <div className="todo-buttons">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(todo); }} className="info-button edit-button" aria-label={t('edit_button_aria')}>{icons.edit}</button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }} className="delete-button" aria-label={t('delete_button')}>{icons.delete}</button>
                        <button onClick={(e) => { e.stopPropagation(); onInfo(todo); }} className="info-button" aria-label={t('info_button_aria')}>{icons.info}</button>
                    </div>
                </div>
            </div>
        </li>
    );
});

const GoalAssistantStepContent: React.FC<{ step: number; t: (key: string) => any; createAI: () => GoogleGenAI | null; [key: string]: any }> = ({ step, t, createAI, ...props }) => {
    const { wish, setWish, outcome, setOutcome, obstacle, setObstacle, plan, setPlan, isRecurring, setIsRecurring, recurringDays, setRecurringDays, deadline, setDeadline, noDeadline, setNoDeadline, errors, language } = props;
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState('');
    const [aiError, setAiError] = useState('');

    const getAIFeedback = async (fieldName: string, value: string) => {
        if (!value) return;
        setIsAiLoading(true);
        setAiFeedback('');
        setAiError('');
        try {
            const ai = createAI();
            if (!ai) {
                setAiError('AI 기능을 사용하려면 설정에서 API 키를 입력해주세요.');
                setIsAiLoading(false);
                return;
            }
            
            const prompt = `Provide concise, actionable feedback on this part of a WOOP goal: ${fieldName} - "${value}". The feedback should be helpful and encouraging, in ${language === 'ko' ? 'Korean' : 'English'}. Keep it to 1-2 sentences.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiFeedback(response.text);
        } catch (error) {
            console.error('AI Feedback Error:', error);
            setAiError('Failed to get AI feedback.');
        } finally {
            setIsAiLoading(false);
        }
    };
    
    switch (step) {
        case 1: return (<div><h3>{t('wish_label')}</h3><div className="step-guidance"><p className="tip">{t('wish_tip')}</p><p className="example">{t('wish_example')}</p></div><textarea value={wish} onChange={(e) => { setWish(e.target.value); setAiFeedback(''); setAiError(''); }} placeholder={t('wish_label')} className={errors.wish ? 'input-error' : ''} rows={3} />{errors.wish && <p className="field-error-message">{icons.exclamation} {t('error_wish_required')}</p>}<div className="ai-feedback-section"><button onClick={() => getAIFeedback('Wish', wish)} disabled={!wish.trim() || isAiLoading} className="ai-feedback-button">{isAiLoading ? <div className="spinner-small" /> : '🤖'}<span>{isAiLoading ? t('ai_analyzing') : t('ai_coach_suggestion')}</span></button>{aiFeedback && <div className="ai-feedback-bubble">{aiFeedback}</div>}{aiError && <div className="ai-feedback-bubble error">{aiError}</div>}</div></div>);
        case 2: return (<div><h3>{t('outcome_label')}</h3><div className="step-guidance"><p className="tip">{t('outcome_tip')}</p><p className="example">{t('outcome_example')}</p></div><textarea value={outcome} onChange={(e) => { setOutcome(e.target.value); setAiFeedback(''); setAiError(''); }} placeholder={t('outcome_label')} className={errors.outcome ? 'input-error' : ''} rows={3} />{errors.outcome && <p className="field-error-message">{icons.exclamation} {t('error_outcome_required')}</p>}<div className="ai-feedback-section"><button onClick={() => getAIFeedback('Outcome', outcome)} disabled={!outcome.trim() || isAiLoading} className="ai-feedback-button">{isAiLoading ? <div className="spinner-small" /> : '🤖'}<span>{isAiLoading ? t('ai_analyzing') : t('ai_coach_suggestion')}</span></button>{aiFeedback && <div className="ai-feedback-bubble">{aiFeedback}</div>}{aiError && <div className="ai-feedback-bubble error">{aiError}</div>}</div></div>);
        case 3: return (<div><h3>{t('obstacle_label')}</h3><div className="step-guidance"><p className="tip">{t('obstacle_tip')}</p><p className="example">{t('obstacle_example')}</p></div><textarea value={obstacle} onChange={(e) => { setObstacle(e.target.value); setAiFeedback(''); setAiError(''); }} placeholder={t('obstacle_label')} className={errors.obstacle ? 'input-error' : ''} rows={3} />{errors.obstacle && <p className="field-error-message">{icons.exclamation} {t('error_obstacle_required')}</p>}<div className="ai-feedback-section"><button onClick={() => getAIFeedback('Obstacle', obstacle)} disabled={!obstacle.trim() || isAiLoading} className="ai-feedback-button">{isAiLoading ? <div className="spinner-small" /> : '🤖'}<span>{isAiLoading ? t('ai_analyzing') : t('ai_coach_suggestion')}</span></button>{aiFeedback && <div className="ai-feedback-bubble">{aiFeedback}</div>}{aiError && <div className="ai-feedback-bubble error">{aiError}</div>}</div></div>);
        case 4: return (<div><h3>{t('plan_label')}</h3><div className="step-guidance"><p className="tip">{t('plan_tip')}</p><p className="example">{t('plan_example')}</p></div><textarea value={plan} onChange={(e) => { setPlan(e.target.value); setAiFeedback(''); setAiError(''); }} placeholder={t('plan_label')} className={errors.plan ? 'input-error' : ''} rows={3} />{errors.plan && <p className="field-error-message">{icons.exclamation} {t('error_plan_required')}</p>}<div className="ai-feedback-section"><button onClick={() => getAIFeedback('Plan', plan)} disabled={!plan.trim() || isAiLoading} className="ai-feedback-button">{isAiLoading ? <div className="spinner-small" /> : '🤖'}<span>{isAiLoading ? t('ai_analyzing') : t('ai_coach_suggestion')}</span></button>{aiFeedback && <div className="ai-feedback-bubble">{aiFeedback}</div>}{aiError && <div className="ai-feedback-bubble error">{aiError}</div>}</div></div>);
        case 5:
            const toggleDay = (dayIndex: number) => {
                const newDays = [...recurringDays];
                const pos = newDays.indexOf(dayIndex);
                if (pos > -1) newDays.splice(pos, 1);
                else newDays.push(dayIndex);
                setRecurringDays(newDays);
            };
            return (<div><h3>{t('recurrence_label')} & {t('deadline_label')}</h3>
                <div className="step-guidance"><p className="tip">{t('recurrence_tip')}</p><p className="example">{t('recurrence_example')}</p></div>
                <label className="settings-item standalone-toggle"><span style={{ fontWeight: 500 }}>{t('recurrence_option_daily')}</span><label className="theme-toggle-switch"><input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} /><span className="slider round"></span></label></label>
                {isRecurring && <div className="day-picker">{t('day_names_short_picker').map((day, i) => <button key={i} onClick={() => toggleDay(i)} className={`day-button ${recurringDays.includes(i) ? 'selected' : ''}`}>{day}</button>)}</div>}
                {errors.recurringDays && <p className="field-error-message">{icons.exclamation} {t('error_day_required')}</p>}
                <hr />
                <div className="step-guidance" style={{ marginTop: '16px' }}><p className="tip">{t('deadline_tip')}</p></div>
                <label className="settings-item standalone-toggle"><span style={{ fontWeight: 500 }}>{t('deadline_option_no_deadline')}</span><label className="theme-toggle-switch"><input type="checkbox" checked={noDeadline} onChange={(e) => setNoDeadline(e.target.checked)} /><span className="slider round"></span></label></label>
                {!noDeadline && <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={errors.deadline ? 'input-error' : ''} style={{ marginTop: '12px' }} />}
                {errors.deadline && <p className="field-error-message">{icons.exclamation} {t('error_deadline_required')}</p>}
            </div>);
        default: return null;
    }
};

const AutomationForm: React.FC<{ onGenerate: (goals: Omit<Goal, 'id' | 'completed' | 'lastCompletedDate' | 'streak'>[]) => void; t: (key: string) => any }> = ({ onGenerate, t }) => {
    const [baseName, setBaseName] = useState('');
    const [totalUnits, setTotalUnits] = useState('');
    const [unitsPerDay, setUnitsPerDay] = useState('');
    const [startDate, setStartDate] = useState('');
    const [error, setError] = useState('');

    const { endDate, generatedCount } = useMemo(() => {
        const units = parseInt(totalUnits, 10);
        const daily = parseInt(unitsPerDay, 10);
        if (!startDate || !units || units <= 0 || !daily || daily <= 0) {
            return { endDate: '', generatedCount: 0 };
        }
        const numGoals = Math.ceil(units / daily);
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + numGoals - 1);
        const endDateString = end.toISOString().split('T')[0];
        return { endDate: endDateString, generatedCount: numGoals };
    }, [totalUnits, unitsPerDay, startDate]);

    const handleGenerate = () => {
        const units = parseInt(totalUnits, 10);
        const daily = parseInt(unitsPerDay, 10);
        if (!baseName.trim() || !startDate || !units || units <= 0 || !daily || daily <= 0) {
            setError(t('automation_error_all_fields'));
            return;
        }

        const newGoals = [];
        const numGoals = Math.ceil(units / daily);
        const start = new Date(startDate);
        
        for (let i = 0; i < numGoals; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(start.getDate() + i);
            
            const startUnit = (i * daily) + 1;
            const endUnit = Math.min((i + 1) * daily, units);
            
            const wish = `${baseName.trim()} ${startUnit}` + (endUnit > startUnit ? ` - ${endUnit}` : '');
            
            newGoals.push({
                wish,
                outcome: '',
                obstacle: '',
                plan: '',
                isRecurring: false,
                recurringDays: [],
                deadline: currentDate.toISOString().split('T')[0],
            });
        }
        
        setError('');
        onGenerate(newGoals);
    };

    return (
        <div className="automation-form-container">
            <h3>{t('automation_title')}</h3>
            <div className="form-group">
                <label>{t('automation_base_name_label')}</label>
                <input type="text" value={baseName} onChange={(e) => setBaseName(e.target.value)} placeholder={t('automation_base_name_placeholder')} />
            </div>
            <div className="automation-form-grid">
                <div className="form-group">
                    <label>{t('automation_total_units_label')}</label>
                    <input type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} placeholder={t('automation_total_units_placeholder')} />
                </div>
                 <div className="form-group">
                    <label>{t('automation_units_per_day_label')}</label>
                    <input type="number" value={unitsPerDay} onChange={(e) => setUnitsPerDay(e.target.value)} placeholder="예: 5" />
                </div>
            </div>
             <div className="automation-form-grid">
                <div className="form-group">
                    <label>{t('automation_start_date_label')}</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>{t('automation_end_date_label')}</label>
                    <input type="date" value={endDate} readOnly />
                </div>
            </div>
            {error && <p className="field-error-message" style={{justifyContent: 'center'}}>{icons.exclamation} {error}</p>}
             <div className="goal-assistant-nav">
                <button onClick={handleGenerate} className="primary" disabled={generatedCount === 0}>
                    {t('automation_generate_button').replace('{count}', String(generatedCount))}
                </button>
            </div>
        </div>
    );
};


const GoalAssistantModal: React.FC<{ onClose: () => void; onAddTodo?: (newTodoData: Omit<Goal, 'id' | 'completed' | 'lastCompletedDate' | 'streak'>) => void; onAddMultipleTodos?: (newTodosData: Omit<Goal, 'id' | 'completed' | 'lastCompletedDate' | 'streak'>[]) => void; onEditTodo?: (updatedTodo: Goal) => void; existingTodo?: Goal; t: (key: string) => any; language: string; createAI: () => GoogleGenAI | null; }> = ({ onClose, onAddTodo, onAddMultipleTodos, onEditTodo, existingTodo, t, language, createAI }) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const [mode, setMode] = useState<'woop' | 'automation'>('woop');
    const [step, setStep] = useState(1);
    const [animationDir, setAnimationDir] = useState<'forward' | 'backward'>('forward');
    const [wish, setWish] = useState(existingTodo?.wish || '');
    const [outcome, setOutcome] = useState(existingTodo?.outcome || '');
    const [obstacle, setObstacle] = useState(existingTodo?.obstacle || '');
    const [plan, setPlan] = useState(existingTodo?.plan || '');
    const [isRecurring, setIsRecurring] = useState(existingTodo?.isRecurring || false);
    const [recurringDays, setRecurringDays] = useState<number[]>(existingTodo?.recurringDays || []);
    const [deadline, setDeadline] = useState(existingTodo?.deadline || '');
    const [noDeadline, setNoDeadline] = useState(!existingTodo?.deadline);
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    const totalSteps = 5;

    const validateStep = (currentStep: number) => {
        const newErrors: { [key: string]: boolean } = {};
        if (currentStep === 1 && !wish.trim()) newErrors.wish = true;
        if (currentStep === 2 && !outcome.trim()) newErrors.outcome = true;
        if (currentStep === 3 && !obstacle.trim()) newErrors.obstacle = true;
        if (currentStep === 4 && !plan.trim()) newErrors.plan = true;
        if (currentStep === 5) {
            if (!noDeadline && !deadline) newErrors.deadline = true;
            if (isRecurring && recurringDays.length === 0) newErrors.recurringDays = true;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (validateStep(step)) {
            if (step < totalSteps) {
                setAnimationDir('forward');
                setStep(s => s + 1);
            } else {
                handleSubmit();
            }
        }
    };
    const handleBack = () => {
        if (step > 1) {
            setAnimationDir('backward');
            setStep(s => s - 1);
        }
    };
    const handleSubmit = () => {
        if (!validateStep(5)) return;
        const goalData = { wish, outcome, obstacle, plan, isRecurring, recurringDays, deadline: noDeadline ? '' : deadline };
        if (existingTodo && onEditTodo) onEditTodo({ ...existingTodo, ...goalData });
        else if (onAddTodo) onAddTodo(goalData);
    };

    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="goal-assistant-modal">
            <div className="goal-assistant-header">
                <div className="goal-assistant-header-left">{step > 1 && mode === 'woop' && <button onClick={handleBack} className="settings-back-button">{icons.back}</button>}</div>
                <h2>{t('goal_assistant_title')}</h2>
                <div className="goal-assistant-header-right"><button onClick={handleClose} className="close-button">{icons.close}</button></div>
            </div>
            
            {!existingTodo && (
                 <div className="modal-mode-switcher-container">
                    <div className="modal-mode-switcher">
                        <button onClick={() => setMode('woop')} className={mode === 'woop' ? 'active' : ''}>{t('goal_assistant_mode_woop')}</button>
                        <button onClick={() => setMode('automation')} className={mode === 'automation' ? 'active' : ''}>{t('goal_assistant_mode_automation')}</button>
                    </div>
                </div>
            )}

            <div className="goal-assistant-body">
                {mode === 'woop' ? (
                    <>
                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${(step / totalSteps) * 100}%` }}></div></div>
                        <div className={`goal-assistant-step-content-animator ${animationDir}`} key={step}>
                            <GoalAssistantStepContent step={step} t={t} createAI={createAI} {...{ wish, setWish, outcome, setOutcome, obstacle, setObstacle, plan, setPlan, isRecurring, setIsRecurring, recurringDays, setRecurringDays, deadline, setDeadline, noDeadline, setNoDeadline, errors, language }} />
                        </div>
                         <div className="goal-assistant-nav">
                            {step > 1 ? (
                                <button onClick={handleBack} className="secondary">{t('back_button')}</button>
                            ) : (
                                <div /> /* Placeholder for alignment */
                            )}
                            <button onClick={handleNext} className="primary">{step === totalSteps ? (existingTodo ? t('save_button') : t('add_button')) : t('next_button')}</button>
                        </div>
                    </>
                ) : (
                    onAddMultipleTodos && <AutomationForm onGenerate={onAddMultipleTodos} t={t} />
                )}
            </div>
        </Modal>
    );
};

const GoalInfoModal: React.FC<{ todo: Goal; onClose: () => void; t: (key: string) => any; createAI: () => GoogleGenAI | null; }> = ({ todo, onClose, t, createAI }) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const [aiFeedback, setAiFeedback] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(false);

    const getAIFeedback = async () => {
        setIsAiLoading(true);
        setAiFeedback('');
        setAiError(false);
        try {
            const ai = createAI();
            if (!ai) {
                setAiFeedback('AI 기능을 사용하려면 설정에서 API 키를 입력해주세요.');
                setIsAiLoading(false);
                return;
            }
            
            const prompt = `Based on the WOOP method, provide a concise and encouraging suggestion for the following goal: Wish: "${todo.wish}", Best Outcome: "${todo.outcome}", Obstacle: "${todo.obstacle}", Plan: "${todo.plan}". Focus on strengthening the plan or reframing the obstacle.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiFeedback(response.text);
        } catch (error) {
            console.error(error);
            setAiError(true);
        } finally {
            setIsAiLoading(false);
        }
    };
    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="info-modal">
            <div className="info-modal-content">
                <h2>{t('goal_details_modal_title')}</h2>
                <div className="info-section"><h4>{t('wish_label')}</h4><p>{todo.wish}</p></div>
                <div className="info-section"><h4>{t('outcome_label')}</h4><p>{todo.outcome}</p></div>
                <div className="info-section"><h4>{t('obstacle_label')}</h4><p>{todo.obstacle}</p></div>
                <div className="info-section"><h4>{t('plan_label')}</h4><p>{todo.plan}</p></div>
                <div className="ai-analysis-section">
                    <h4>{t('ai_coach_suggestion')}</h4>
                    {isAiLoading ? <p>{t('ai_analyzing')}</p> : aiFeedback ? <p>{aiFeedback}</p> : aiError ? <p className="ai-error">{t('ai_sort_error_message')}</p> : <button onClick={getAIFeedback} className="feedback-button">{t('ai_coach_suggestion')}</button>}
                </div>
            </div>
            <div className="modal-buttons"><button onClick={handleClose} className="primary">{t('close_button')}</button></div>
        </Modal>
    );
};

// 모양 설명(타입)은 밖에!
interface FolderCollaborationModalProps {
    folder: Folder | null;
    onClose: () => void;
    t: (key: string) => any;
    googleUser: User | null;
    onUpdateCollaborators: (folderId: string | null, collaborators: Collaborator[]) => void;
    setAlertConfig: (config: any) => void;
}

// 진짜 동작(함수)은 안에!
const FolderCollaborationModal: React.FC<FolderCollaborationModalProps> = ({ folder, onClose, t, googleUser, onUpdateCollaborators, setAlertConfig }) => {
    // 중복 없이 한 번만 선언!
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const [shareableLink, setShareableLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkPassword, setLinkPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    // 공유 링크 생성 함수
    const handleCreateShareLink = async () => {
        if (!folder || !googleUser) return;
        setIsGeneratingLink(true);
        try {
            // 공유 링크용 고유 ID 생성 (예: 폴더ID + 랜덤)
            const linkId = `${folder.id}-${Math.random().toString(36).substr(2, 8)}`;
            // Firestore REST API용 데이터 구조 (fields)
            const shareData = {
                fields: {
                    folderId: { stringValue: folder.id },
                    ownerId: { stringValue: googleUser.uid },
                    createdAt: { stringValue: new Date().toISOString() },
                    ...(showPasswordInput && linkPassword ? { password: { stringValue: linkPassword } } : {})
                }
            };
            // fetch로 Firestore REST API 호출
            // firestoreFetch는 정적 import로 대체됨
            await firestoreFetch(`/shared_links/${linkId}`, {
                method: 'PATCH',
                body: JSON.stringify(shareData)
            });
            // 실제로 쓸 수 있는 공유 링크 생성 (예: 도메인 + /share/{linkId})
            const baseUrl = window.location.origin;
            setShareableLink(`${baseUrl}/share/${linkId}`);
        } catch (e) {
            console.error('공유 링크 생성 실패:', e);
            setAlertConfig({
                title: '공유 링크 생성 실패',
                message: '공유 링크를 만드는 중 오류가 발생했어요.',
                confirmText: '확인',
                onConfirm: () => {}
            });
        } finally {
            setIsGeneratingLink(false);
        }
    };
    // 클립보드 복사 함수
    const handleCopyLink = () => {
        if (shareableLink) {
            navigator.clipboard.writeText(shareableLink);
            setAlertConfig({
                title: '복사 완료',
                message: '링크가 클립보드에 복사됐어요!',
                confirmText: '확인',
                onConfirm: () => {}
            });
        }
    };


    // 함수 안에 같은 내용이 두 번 들어가 있으면 안 돼! return은 한 번만 써야 해!
    if (!folder) return null;
    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="goal-assistant-modal">
            <div className="goal-assistant-header">
                <div className="goal-assistant-header-left" />
                <h2>{folder.name} 폴더 공유</h2>
                <div className="goal-assistant-header-right"><button onClick={handleClose} className="close-button">{icons.close}</button></div>
            </div>
            <div className="goal-assistant-body">
                <div style={{ padding: '24px 16px' }}>
                    {/* 협업자 목록 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>현재 협업자</h3>
                        {folder.collaborators && folder.collaborators.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {folder.collaborators.map((collab) => (
                                    <div key={collab.userId} className="settings-item" style={{ padding: '12px', backgroundColor: 'var(--card-bg-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{collab.email}</div>
                                            {collab.role === 'owner' ? (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary-color)', marginTop: '2px' }}>소유자</div>
                                            ) : (
                                                <select 
                                                    value={collab.role}
                                                    onChange={(e) => handleChangeCollaboratorRole(collab.userId, e.target.value as 'editor' | 'viewer')}
                                                    style={{ 
                                                        fontSize: '0.85rem', 
                                                        padding: '4px 8px',
                                                        marginTop: '4px',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border-color)',
                                                        backgroundColor: 'var(--input-bg-color)',
                                                        color: 'var(--text-color)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="editor">편집자</option>
                                                    <option value="viewer">뷰어</option>
                                                </select>
                                            )}
                                        </div>
                                        {collab.role !== 'owner' && (
                                            <button 
                                                onClick={() => handleRemoveCollaborator(collab.userId)}
                                                style={{ 
                                                    padding: '4px 12px', 
                                                    backgroundColor: 'var(--danger-color)', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    marginLeft: '12px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                제거
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="step-guidance"><p className="tip">협업자가 없습니다. 공유 링크로 협업자를 추가하세요.</p></div>
                        )}
                    </div>

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {/* 공유 링크 섹션 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>공유 링크로 협업자 추가</h3>
                        <div className="step-guidance"><p className="tip">공유 링크를 생성하고 협업자에게 전달하면, 그들이 해당 폴더에 접근할 수 있습니다.</p></div>
                        {!shareableLink ? (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* 암호 설정 옵션 */}
                                <label className="settings-item standalone-toggle">
                                    <span style={{ fontWeight: '500' }}>링크에 암호 설정</span>
                                    <label className="theme-toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={showPasswordInput}
                                            onChange={(e) => {
                                                setShowPasswordInput(e.target.checked);
                                                if (!e.target.checked) setLinkPassword('');
                                            }}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </label>
                                {showPasswordInput && (
                                    <input 
                                        type="password" 
                                        placeholder="암호 입력" 
                                        value={linkPassword}
                                        onChange={(e) => setLinkPassword(e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            borderRadius: '8px', 
                                            border: '1px solid var(--border-color)', 
                                            backgroundColor: 'var(--input-bg-color)', 
                                            color: 'var(--text-color)',
                                            fontFamily: 'inherit',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                )}
                                <button 
                                    onClick={handleCreateShareLink}
                                    disabled={isGeneratingLink || (showPasswordInput && !linkPassword.trim())}
                                    className="primary"
                                    style={{
                                        width: '100%',
                                        padding: '14px 0',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '24px',
                                        boxShadow: '0 2px 8px rgba(88,86,214,0.08)',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        letterSpacing: '0.01em',
                                        cursor: isGeneratingLink || (showPasswordInput && !linkPassword.trim()) ? 'not-allowed' : 'pointer',
                                        opacity: isGeneratingLink || (showPasswordInput && !linkPassword.trim()) ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isGeneratingLink ? '링크 생성 중...' : '공유 링크 생성'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shareableLink} 
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            backgroundColor: 'var(--input-bg-color)',
                                            color: 'var(--text-color)',
                                            fontSize: '0.85rem',
                                            boxSizing: 'border-box',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button 
                                        onClick={handleCopyLink}
                                        className="primary"
                                    >
                                        클립보드 복사
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShareableLink('');
                                            setLinkPassword('');
                                            setShowPasswordInput(false);
                                        }}
                                        className="secondary"
                                    >
                                        새로 생성
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="goal-assistant-nav">
                <div />
                <button onClick={handleClose} className="primary">닫기</button>
            </div>
        </Modal>
    );

    const handleRemoveCollaborator = async (userId: string) => {
        if (!folder || !googleUser) return;
        try {
            // const foldersRef = collection(db, 'users', googleUser.uid, 'folders');
            // const folderDocRef = doc(foldersRef, folder.id);
            const updatedCollaborators = (folder.collaborators || []).filter(c => c.userId !== userId);
            // await setDoc(folderDocRef, {
            //     collaborators: updatedCollaborators,
            //     updatedAt: new Date().toISOString()
            // }, { merge: true });
            onUpdateCollaborators(folder.id, updatedCollaborators);
            setAlertConfig({
                title: '제거 완료',
                message: '협업자가 제거되었습니다.',
                confirmText: '확인',
                onConfirm: () => {}
            });
        } catch (error) {
            console.error('협업자 제거 실패:', error);
            setAlertConfig({
                title: '제거 실패',
                message: `협업자 제거에 실패했습니다.`,
                confirmText: '확인',
                onConfirm: () => {}
            });
        }
    };

    const handleChangeCollaboratorRole = async (userId: string, newRole: 'editor' | 'viewer') => {
        if (!folder || !googleUser) return;
        try {
            // const foldersRef = collection(db, 'users', googleUser.uid, 'folders');
            // const folderDocRef = doc(foldersRef, folder.id);
            const updatedCollaborators = (folder.collaborators || []).map(c => 
                c.userId === userId ? { ...c, role: newRole } : c
            );
            // await setDoc(folderDocRef, {
            //     collaborators: updatedCollaborators,
            //     updatedAt: new Date().toISOString()
            // }, { merge: true });
            onUpdateCollaborators(folder.id, updatedCollaborators);
            setAlertConfig({
                title: '권한 변경 완료',
                message: `협업자의 권한이 ${newRole === 'editor' ? '편집자' : '뷰어'}로 변경되었습니다.`,
                confirmText: '확인',
                onConfirm: () => {}
            });
        } catch (error) {
            console.error('권한 변경 실패:', error);
        }
    };

    if (!folder) return null;

    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="goal-assistant-modal">
            <div className="goal-assistant-header">
                <div className="goal-assistant-header-left" />
                <h2>{folder.name} 폴더 공유</h2>
                <div className="goal-assistant-header-right"><button onClick={handleClose} className="close-button">{icons.close}</button></div>
            </div>

            <div className="goal-assistant-body">
                <div style={{ padding: '24px 16px' }}>
                    {/* 현재 협업자 목록 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>현재 협업자</h3>
                        {folder.collaborators && folder.collaborators.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {folder.collaborators.map((collab) => (
                                    <div key={collab.userId} className="settings-item" style={{ padding: '12px', backgroundColor: 'var(--card-bg-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{collab.email}</div>
                                            {collab.role === 'owner' ? (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary-color)', marginTop: '2px' }}>소유자</div>
                                            ) : (
                                                <select 
                                                    value={collab.role}
                                                    onChange={(e) => handleChangeCollaboratorRole(collab.userId, e.target.value as 'editor' | 'viewer')}
                                                    style={{ 
                                                        fontSize: '0.85rem', 
                                                        padding: '4px 8px',
                                                        marginTop: '4px',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border-color)',
                                                        backgroundColor: 'var(--input-bg-color)',
                                                        color: 'var(--text-color)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="editor">편집자</option>
                                                    <option value="viewer">뷰어</option>
                                                </select>
                                            )}
                                        </div>
                                        {collab.role !== 'owner' && (
                                            <button 
                                                onClick={() => handleRemoveCollaborator(collab.userId)}
                                                style={{ 
                                                    padding: '4px 12px', 
                                                    backgroundColor: 'var(--danger-color)', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '4px', 
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    marginLeft: '12px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                제거
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="step-guidance"><p className="tip">협업자가 없습니다. 공유 링크로 협업자를 추가하세요.</p></div>
                        )}
                    </div>

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

                    {/* 공유 링크 섹션 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>공유 링크로 협업자 추가</h3>
                        <div className="step-guidance"><p className="tip">공유 링크를 생성하고 협업자에게 전달하면, 그들이 해당 폴더에 접근할 수 있습니다.</p></div>
                        
                        {!shareableLink ? (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {/* 암호 설정 옵션 */}
                                <label className="settings-item standalone-toggle">
                                    <span style={{ fontWeight: '500' }}>링크에 암호 설정</span>
                                    <label className="theme-toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={showPasswordInput}
                                            onChange={(e) => {
                                                setShowPasswordInput(e.target.checked);
                                                if (!e.target.checked) setLinkPassword('');
                                            }}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </label>
                                
                                {showPasswordInput && (
                                    <input 
                                        type="password" 
                                        placeholder="암호 입력" 
                                        value={linkPassword}
                                        onChange={(e) => setLinkPassword(e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            borderRadius: '8px', 
                                            border: '1px solid var(--border-color)', 
                                            backgroundColor: 'var(--input-bg-color)', 
                                            color: 'var(--text-color)',
                                            fontFamily: 'inherit',
                                            fontSize: '14px',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                )}
                                
                                <button 
                                    onClick={handleCreateShareLink}
                                    disabled={isGeneratingLink || !linkPassword.trim()}
                                    className="primary"
                                    style={{
                                        width: '100%',
                                        padding: '14px 0',
                                        backgroundColor: 'var(--primary-color)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '24px',
                                        boxShadow: '0 2px 8px rgba(88,86,214,0.08)',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        letterSpacing: '0.01em',
                                        cursor: isGeneratingLink || !linkPassword.trim() ? 'not-allowed' : 'pointer',
                                        opacity: isGeneratingLink || !linkPassword.trim() ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isGeneratingLink ? '링크 생성 중...' : '공유 링크 생성'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--card-bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shareableLink} 
                                        onClick={(e) => (e.target as HTMLInputElement).select()}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            backgroundColor: 'var(--input-bg-color)',
                                            color: 'var(--text-color)',
                                            fontSize: '0.85rem',
                                            boxSizing: 'border-box',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button 
                                        onClick={handleCopyLink}
                                        className="primary"
                                    >
                                        클립보드 복사
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShareableLink('');
                                            setLinkPassword('');
                                            setShowPasswordInput(false);
                                        }}
                                        className="secondary"
                                    >
                                        새로 생성
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="goal-assistant-nav">
                <div />
                <button onClick={handleClose} className="primary">닫기</button>
            </div>
        </Modal>
    );
};

const CollaborationModal: React.FC<{ 
    goal: Goal; 
    onClose: () => void; 
    t: (key: string) => any; 
    googleUser: User | null;
    onUpdateCollaborators: (goalId: number, collaborators: Collaborator[]) => void;
}> = ({ goal, onClose, t, googleUser, onUpdateCollaborators }) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !googleUser) return;
        
        setIsInviting(true);
        try {
            // 새 협업자 추가
            const newCollaborator: Collaborator = {
                userId: `invited_${Date.now()}`,  // 임시 ID (실제로는 Firebase Auth로 생성)
                email: inviteEmail,
                role: inviteRole,
                addedAt: new Date().toISOString()
            };

            const updatedCollaborators = [...(goal.collaborators || []), newCollaborator];
            onUpdateCollaborators(goal.id, updatedCollaborators);
            setInviteEmail('');
            setInviteRole('editor');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveCollaborator = (userId: string) => {
        const updatedCollaborators = (goal.collaborators || []).filter(c => c.userId !== userId);
        onUpdateCollaborators(goal.id, updatedCollaborators);
    };

    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="collaboration-modal">
            <div style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>🤝 협업 공유</h2>
                
                {/* 현재 협업자 목록 */}
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '12px' }}>현재 협업자</h3>
                    {goal.collaborators && goal.collaborators.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {goal.collaborators.map((collab) => (
                                <div key={collab.userId} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    padding: '10px', 
                                    backgroundColor: 'var(--card-bg-color)', 
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{collab.email}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary-color)' }}>
                                            {collab.role === 'owner' ? '소유자' : collab.role === 'editor' ? '편집자' : '뷰어'}
                                        </div>
                                    </div>
                                    {collab.role !== 'owner' && (
                                        <button 
                                            onClick={() => handleRemoveCollaborator(collab.userId)}
                                            style={{ 
                                                padding: '4px 12px', 
                                                backgroundColor: 'var(--danger-color)', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '4px', 
                                                cursor: 'pointer',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            제거
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-secondary-color)', fontSize: '0.9rem' }}>협업자가 없습니다.</p>
                    )}
                </div>

                {/* 협업자 초대 */}
                <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '12px' }}>협업자 초대</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input 
                            type="email" 
                            placeholder="이메일 주소 입력" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '6px', 
                                border: '1px solid var(--border-color)', 
                                backgroundColor: 'var(--input-bg-color)', 
                                color: 'var(--text-color)',
                                fontFamily: 'inherit'
                            }}
                        />
                        <select 
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '6px', 
                                border: '1px solid var(--border-color)', 
                                backgroundColor: 'var(--input-bg-color)', 
                                color: 'var(--text-color)',
                                fontFamily: 'inherit',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="editor">편집자 (수정 가능)</option>
                            <option value="viewer">뷰어 (읽기만)</option>
                        </select>
                        <button 
                            onClick={handleInvite}
                            disabled={!inviteEmail.trim() || isInviting}
                            style={{ 
                                padding: '10px', 
                                backgroundColor: 'var(--primary-color)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: isInviting ? 'not-allowed' : 'pointer',
                                fontWeight: 500,
                                opacity: isInviting || !inviteEmail.trim() ? 0.6 : 1
                            }}
                        >
                            {isInviting ? '초대 중...' : '초대하기'}
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleClose} className="primary">닫기</button>
                </div>
            </div>
        </Modal>
    );
};

const SettingsModal: React.FC<{
    onClose: () => void;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    themeMode: 'light' | 'dark' | 'system';
    onThemeChange: (mode: 'light' | 'dark' | 'system') => void;
    backgroundTheme: string;
    onSetBackgroundTheme: (theme: string) => void;
    onExportData: () => void;
    onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setAlertConfig: (config: any) => void;
    onDeleteAllData: () => void;
    dataActionStatus: 'idle' | 'importing' | 'exporting' | 'deleting';
    language: string;
    onSetLanguage: (lang: string) => void;
    t: (key: string) => any;
    todos: Goal[];
    setToastMessage: (message: string) => void;
    onOpenVersionInfo: () => void;
    onOpenUsageGuide: () => void;
    apiKey: string;
    onSetApiKey: (key: string) => void;
    isOfflineMode: boolean;
    onToggleOfflineMode: () => void;
}> = ({
    onClose, isDarkMode, onToggleDarkMode, themeMode, onThemeChange, backgroundTheme, onSetBackgroundTheme,
    onExportData, onImportData, setAlertConfig, onDeleteAllData, dataActionStatus,
    language, onSetLanguage, t, todos, setToastMessage, onOpenVersionInfo, onOpenUsageGuide,
    apiKey, onSetApiKey, isOfflineMode, onToggleOfflineMode
}) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const [activeTab, setActiveTab] = useState('appearance');
    const [shareableLink, setShareableLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const tabs = [
        { id: 'appearance', label: t('settings_section_background'), icon: icons.background },
        { id: 'general', label: t('settings_section_general'), icon: icons.settings },
        { id: 'data', label: t('settings_section_data'), icon: icons.data },
    ];

    const handleDeleteClick = () => setAlertConfig({ 
        title: t('delete_account_header'), 
        message: t('delete_account_header_desc'), 
        isDestructive: true, 
        confirmText: t('delete_all_data_button'), 
        cancelText: t('cancel_button'), 
        onConfirm: onDeleteAllData,
        onCancel: () => {}
    });

    const handleCreateShareLink = async () => {
        // 데이터가 없는지 확인
        if (!todos || todos.length === 0) {
            alert(t('no_data_to_share'));
            return;
        }
        
        setIsGeneratingLink(true);
        
        try {
            // 데이터 압축 및 인코딩
            const encodedData = compressDataForUrl(todos);
            const longUrl = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encodedData)}`;
            
            // 단축 URL 생성 시도 (길이가 긴 경우만)
            const finalUrl = await createShortUrl(longUrl);
            setShareableLink(finalUrl);
            
            // 단축 URL이 생성되었는지 확인하고 토스트 메시지 표시
            if (finalUrl !== longUrl && finalUrl.length < longUrl.length) {
                setToastMessage(t('short_url_created'));
            } else {
                setToastMessage(t('share_link_created'));
            }
        } catch (e) {
            console.error("Failed to create share link", e);
            // 실패 시 기본 URL 사용
            const encodedData = compressDataForUrl(todos);
            const url = `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encodedData)}`;
            setShareableLink(url);
            setToastMessage(t('short_url_failed'));
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleCopyLink = () => {
        if (shareableLink) {
            navigator.clipboard.writeText(shareableLink).then(() => {
                setToastMessage(t('link_copied_toast'));
            });
        }
    };

    const renderTabContent = () => {
        try {
            switch (activeTab) {
                case 'appearance':
                    return (
                        <>
                            <div className="settings-section-header">테마 모드</div>
                            <div className="settings-section-body">
                                <div className="settings-item nav-indicator" onClick={() => onThemeChange('light')}>
                                    <div>
                                        <span>라이트 모드</span>
                                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>항상 밝은 테마 사용</div>
                                    </div>
                                    {themeMode === 'light' && icons.check}
                                </div>
                                <div className="settings-item nav-indicator" onClick={() => onThemeChange('dark')}>
                                    <div>
                                        <span>다크 모드</span>
                                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>항상 어두운 테마 사용</div>
                                    </div>
                                    {themeMode === 'dark' && icons.check}
                                </div>
                                <div className="settings-item nav-indicator" onClick={() => onThemeChange('system')}>
                                    <div>
                                        <span>시스템 설정 따라가기</span>
                                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>기기의 다크모드 설정에 맞춰 자동 변경</div>
                                    </div>
                                    {themeMode === 'system' && icons.check}
                                </div>
                            </div>
                            <div className="settings-section-header">{t('settings_background_header')}</div>
                            <div className="settings-section-body">
                               {backgroundOptions.map(option => (
                                    <div key={option.id} className="settings-item nav-indicator" onClick={() => onSetBackgroundTheme(option.id)}>
                                        <span>{t(isDarkMode ? option.darkNameKey : option.lightNameKey)}</span>
                                        {backgroundTheme === option.id && icons.check}
                                    </div>
                                ))}
                            </div>
                        </>
                    );
                case 'general':
                    return (
                        <>
                            <div className="settings-section-header">{t('settings_api_key')}</div>
                            <div className="settings-section-body">
                                <div className="settings-item">
                                    <input
                                        type="password"
                                        placeholder={t('settings_api_key_placeholder')}
                                        value={apiKey}
                                        onChange={(e) => onSetApiKey(e.target.value)}
                                        style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--input-bg)' }}
                                    />
                                </div>
                                <label className="settings-item">
                                    <div>
                                        <span>{t('settings_offline_mode')}</span>
                                        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>{t('settings_offline_mode_desc')}</div>
                                    </div>
                                    <div className="theme-toggle-switch">
                                        <input type="checkbox" checked={isOfflineMode} onChange={onToggleOfflineMode} />
                                        <span className="slider round"></span>
                                    </div>
                                </label>
                            </div>
                            <div className="settings-section-header">{t('settings_language')}</div>
                            <div className="settings-section-body">
                                <div className="settings-item nav-indicator" onClick={() => onSetLanguage('ko')}><span>한국어</span>{language === 'ko' && icons.check}</div>
                                <div className="settings-item nav-indicator" onClick={() => onSetLanguage('en')}><span>English</span>{language === 'en' && icons.check}</div>
                            </div>
                            <div className="settings-section-header">{t('settings_section_info')}</div>
                            <div className="settings-section-body">
                                <div className="settings-item nav-indicator" onClick={onOpenVersionInfo}>
                                    <span>{t('settings_version')}</span>
                                    <div className="settings-item-value-with-icon">
                                        <span>1.2</span>
                                        {icons.forward}
                                    </div>
                                </div>
                                <div className="settings-item nav-indicator" onClick={onOpenUsageGuide}>
                                    <span>{t('usage_guide_title')}</span>
                                    <div className="settings-item-value-with-icon">
                                        {icons.forward}
                                    </div>
                                </div>
                                <div className="settings-item">
                                    <span>{t('settings_developer')}</span>
                                    <span className="settings-item-value">{t('developer_name')}</span>
                                </div>
                                 <div className="settings-item">
                                    <span>{t('settings_copyright')}</span>
                                    <span className="settings-item-value">{t('copyright_notice')}</span>
                                </div>
                            </div>
                        </>
                    );
                case 'data':
                    return (
                        <>
                            <div className="settings-section-header">{t('settings_data_header') || '데이터 관리'}</div>
                            <div className="settings-section-body">
                                <button 
                                    className="settings-item action-item" 
                                    onClick={onExportData} 
                                    disabled={dataActionStatus !== 'idle'}
                                >
                                    <span className="action-text">
                                        {dataActionStatus === 'exporting' ? (t('data_exporting') || '내보내는 중...') : (t('settings_export_data') || '내보내기')}
                                    </span>
                                </button>
                                <button 
                                    className="settings-item action-item" 
                                    onClick={() => {
                                        try {
                                            fileInputRef.current?.click();
                                        } catch (error) {
                                            console.error('File input click error:', error);
                                        }
                                    }} 
                                    disabled={dataActionStatus !== 'idle'}
                                >
                                    <span className="action-text">
                                        {dataActionStatus === 'importing' ? (t('data_importing') || '가져오는 중...') : (t('settings_import_data') || '가져오기')}
                                    </span>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={onImportData} 
                                        accept=".json" 
                                        style={{ display: 'none' }} 
                                    />
                                </button>
                            </div>

                            <div className="settings-section-header">{t('settings_share_link_header') || '링크로 공유'}</div>
                            <div className="settings-section-body">
                                {!shareableLink && (
                                    <button 
                                        className="settings-item action-item" 
                                        onClick={() => {
                                            try {
                                                handleCreateShareLink();
                                            } catch (error) {
                                                console.error('Share link creation error:', error);
                                                setToastMessage('공유 링크 생성 중 오류가 발생했습니다.');
                                            }
                                        }}
                                        disabled={isGeneratingLink}
                                    >
                                        <span className="action-text">
                                            {isGeneratingLink ? '🔗 단축 URL 생성 중...' : (t('settings_generate_link') || '공유 링크 생성')}
                                        </span>
                                    </button>
                                )}
                                {shareableLink && (
                                    <div className="share-link-container">
                                        <div style={{ marginBottom: '8px', fontSize: '12px', opacity: 0.7 }}>
                                            {shareableLink.length < 100 ? '📎 단축 URL' : '🔗 일반 링크'} 
                                            ({shareableLink.length}자)
                                        </div>
                                        <input type="text" readOnly value={shareableLink} onClick={(e) => (e.target as HTMLInputElement).select()} />
                                        <button onClick={() => {
                                            try {
                                                handleCopyLink();
                                            } catch (error) {
                                                console.error('Copy link error:', error);
                                            }
                                        }}>{t('settings_copy_link') || '링크 복사'}</button>
                                    </div>
                                )}
                            </div>

                            <div className="settings-section-header">{t('settings_delete_account') || '모든 데이터 삭제'}</div>
                            <div className="settings-section-body">
                                <button 
                                    className="settings-item action-item" 
                                    onClick={() => {
                                        try {
                                            handleDeleteClick();
                                        } catch (error) {
                                            console.error('Delete click error:', error);
                                        }
                                    }} 
                                    disabled={dataActionStatus !== 'idle'}
                                >
                                    <span className="action-text destructive">
                                        {dataActionStatus === 'deleting' ? (t('data_deleting') || '삭제 중...') : (t('settings_delete_account') || '모든 데이터 삭제')}
                                    </span>
                                </button>
                            </div>
                        </>
                    );
                default: 
                    return (
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <p>설정을 로드하는 중 오류가 발생했습니다.</p>
                            <button 
                                onClick={() => setActiveTab('appearance')}
                                style={{ 
                                    marginTop: '10px', 
                                    padding: '8px 16px', 
                                    backgroundColor: 'var(--primary-color)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                외관 설정으로 이동
                            </button>
                        </div>
                    );
            }
        } catch (error) {
            console.error('Settings tab rendering error:', error);
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>설정 탭을 표시하는 중 오류가 발생했습니다.</p>
                    <p style={{ fontSize: '12px', color: 'red', marginTop: '10px' }}>
                        오류: {error instanceof Error ? error.message : '알 수 없는 오류'}
                    </p>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        style={{ 
                            marginTop: '10px', 
                            padding: '8px 16px', 
                            backgroundColor: 'var(--primary-color)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        외관 설정으로 이동
                    </button>
                </div>
            );
        }
    }
    
    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="settings-modal">
            <div className="settings-modal-header">
                <div />
                <h2>{t('settings_title')}</h2>
                <div className="settings-modal-header-right">
                    <button onClick={handleClose} className="close-button">{icons.close}</button>
                </div>
            </div>
            <div className="settings-modal-body">
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            aria-label={tab.label}
                        >
                            <div className="settings-tab-icon">{tab.icon}</div>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="settings-tab-content-container">
                    <div className="settings-tab-content" key={activeTab}>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const VersionInfoModal: React.FC<{ onClose: () => void; t: (key: string) => any; }> = ({ onClose, t }) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);
    const buildNumber = "1.2 (25.10.20)";

    const changelogItems = [
        { icon: icons.ai, titleKey: 'version_update_1_title', descKey: 'version_update_1_desc' },
        { icon: icons.globe, titleKey: 'version_update_2_title', descKey: 'version_update_2_desc' },
        { icon: icons.background, titleKey: 'version_update_3_title', descKey: 'version_update_3_desc' },
    ];

    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="version-info-modal">
            {/* 버전 정보 섹션 */}
            <div className="version-info-header">
                <h2>{t('version_update_title')}</h2>
                <p>{t('build_number')}: {buildNumber}</p>
            </div>
            
            <div className="version-info-body">
                {changelogItems.map((item, index) => (
                    <div className="changelog-item" key={index}>
                        <div className="changelog-icon" style={{'--icon-bg': 'var(--primary-color)'} as React.CSSProperties}>{item.icon}</div>
                        <div className="changelog-text">
                            <h3>{t(item.titleKey)}</h3>
                            <p>{t(item.descKey)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="modal-buttons">
                <button onClick={handleClose} className="primary">{t('settings_done_button')}</button>
            </div>
        </Modal>
    );
};

const UsageGuideModal: React.FC<{ onClose: () => void; t: (key: string) => any; }> = ({ onClose, t }) => {
    const [isClosing, handleClose] = useModalAnimation(onClose);

    const renderTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        
        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="guide-link">
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    const usageGuideItems = [
        { titleKey: 'usage_basic_title', descKey: 'usage_basic_desc' },
        { titleKey: 'usage_ai_setup_title', descKey: 'usage_ai_setup_desc' },
        { titleKey: 'usage_ai_use_title', descKey: 'usage_ai_use_desc' },
        { titleKey: 'usage_share_title', descKey: 'usage_share_desc' },
        { titleKey: 'usage_theme_title', descKey: 'usage_theme_desc' },
        { titleKey: 'usage_calendar_title', descKey: 'usage_calendar_desc' },
        { titleKey: 'usage_offline_title', descKey: 'usage_offline_desc' },
    ];

    return (
        <Modal onClose={handleClose} isClosing={isClosing} className="usage-guide-modal">
            <div className="version-info-header">
                <h2>{t('usage_guide_title')}</h2>
            </div>
            
            <div className="version-info-body">
                {usageGuideItems.map((item, index) => (
                    <div className="usage-guide-item" key={index}>
                        <h3>{t(item.titleKey)}</h3>
                        <p>{item.titleKey === 'usage_ai_setup_title' ? renderTextWithLinks(t(item.descKey)) : t(item.descKey)}</p>
                    </div>
                ))}
            </div>
            <div className="modal-buttons">
                <button onClick={handleClose} className="primary">{t('settings_done_button')}</button>
            </div>
        </Modal>
    );
};


const CalendarView: React.FC<{ todos: Goal[]; t: (key: string) => any; onGoalClick: (todo: Goal) => void; language: string; }> = ({ todos, t, onGoalClick, language }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day3' | 'week' | 'month'>('week');

    const changeDate = (amount: number) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + amount);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
        else newDate.setDate(newDate.getDate() + (amount * 3));
        setCurrentDate(newDate);
    };

    const calendarData = useMemo(() => {
        const days = [];
        let startDate: Date;
        let numDays: number;
        
        if (viewMode === 'month') {
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            startDate = getStartOfWeek(firstDay, language === 'ko' ? 1 : 0);
            numDays = 42;
        } else if (viewMode === 'week') {
            startDate = getStartOfWeek(currentDate, language === 'ko' ? 1 : 0);
            numDays = 7;
        } else {
            startDate = new Date(currentDate);
            startDate.setDate(startDate.getDate() - 1);
            numDays = 3;
        }

        for (let i = 0; i < numDays; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentDate, viewMode, language]);

    const headerTitle = useMemo(() => {
        if (viewMode === 'month') {
            const year = currentDate.getFullYear();
            const month = t('month_names')[currentDate.getMonth()];
            const format = t('calendar_header_month_format');
            if (format && typeof format === 'string' && format !== 'calendar_header_month_format') {
                return format.replace('{year}', String(year)).replace('{month}', month);
            }
            return `${month} ${year}`;
        }
        return `${currentDate.getFullYear()}.${currentDate.getMonth() + 1}`;
    }, [currentDate, viewMode, t]);

    const dayNames = useMemo(() => {
        const days = t('day_names_short');
        if (language === 'ko' && Array.isArray(days)) {
            // "일"을 맨 뒤로 보내서 "월,화,수,목,금,토,일" 순서로 만듭니다.
            const [sunday, ...restOfWeek] = days;
            return [...restOfWeek, sunday];
        }
        return days; // 영어는 "Sun,Mon..." 순서 그대로 사용합니다.
    }, [language, t]);

    return (
        <div className="calendar-view-container">
            <div className="calendar-header">
                <button onClick={() => changeDate(-1)}>{icons.back}</button><h2>{headerTitle}</h2><button onClick={() => changeDate(1)}>{icons.forward}</button>
            </div>
            <div className="calendar-view-mode-selector">
                <button onClick={() => setViewMode('day3')} className={viewMode === 'day3' ? 'active' : ''}>{t('calendar_view_day3')}</button>
                <button onClick={() => setViewMode('week')} className={viewMode === 'week' ? 'active' : ''}>{t('calendar_view_week')}</button>
                <button onClick={() => setViewMode('month')} className={`calendar-view-button-month ${viewMode === 'month' ? 'active' : ''}`}>{t('calendar_view_month')}</button>
            </div>
            {(viewMode === 'week' || viewMode === 'month') && <div className="calendar-days-of-week">{Array.isArray(dayNames) && dayNames.map(day => <div key={day}>{day}</div>)}</div>}
            <div className={`calendar-grid view-mode-${viewMode}`}>
                {calendarData.map((day) => {
                    const today = new Date();
                    const isToday = isSameDay(day, today);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const goalsForDay = todos.filter(todo => {
                        if (todo.isRecurring) {
                            const dayOfWeek = (day.getDay() + 6) % 7; // 0=Mon, 6=Sun
                            return todo.recurringDays.includes(dayOfWeek);
                        }
                        return todo.deadline && isSameDay(day, todo.deadline);
                    });
                    return (
                        <div key={day.toISOString()} className={`calendar-day ${!isCurrentMonth && viewMode === 'month' ? 'not-current-month' : ''} ${isToday ? 'is-today' : ''}`} data-day-name={t('day_names_long')[day.getDay()]}>
                            <div className="day-header"><span className="day-number">{day.getDate()}</span></div>
                            <div className="calendar-goals">{goalsForDay.map(goal => <div key={goal.id} className={`calendar-goal-item ${goal.completed && (goal.lastCompletedDate && isSameDay(day, goal.lastCompletedDate)) ? 'completed' : ''}`} onClick={() => onGoalClick(goal)}>{goal.wish}</div>)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AlertModal: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel?: () => void; confirmText?: string; cancelText?: string; isDestructive?: boolean; t: (key: string) => any; }> = ({ title, message, onConfirm, onCancel, confirmText, cancelText, isDestructive, t }) => {
    const hasCancel = typeof onCancel === 'function';
    return (
        <div className="modal-backdrop alert-backdrop">
            <div className="modal-content alert-modal">
                <div className="alert-content"><h2>{title}</h2><p dangerouslySetInnerHTML={{ __html: message }} /></div>
                <div className="modal-buttons">
                    {hasCancel && <button onClick={onCancel} className="secondary">{cancelText || t('cancel_button')}</button>}
                    <button onClick={onConfirm} className={isDestructive ? 'destructive' : 'primary'}>{confirmText || t('confirm_button')}</button>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
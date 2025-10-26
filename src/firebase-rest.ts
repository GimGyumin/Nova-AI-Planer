// src/firebase-rest.ts
// Firestore REST API fetch 유틸리티 (최소 버전)

export async function firestoreFetch(path: string, options: RequestInit = {}) {
  // 환경 변수에서 프로젝트 ID와 API 키를 가져옵니다.
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) throw new Error('Firebase REST 환경변수 누락');

  // Firestore REST API 엔드포인트
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  let url = path.startsWith('/') ? baseUrl + path : `${baseUrl}/${path}`;
  if (!url.includes('?')) url += `?key=${apiKey}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`Firestore REST 오류: ${res.status}`);
  return await res.json();
}

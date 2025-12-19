# Supabase 설정 가이드

## 1. Supabase 대시보드에서 테이블 생성

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택 (ahprgrnzklukdacfmbzu)
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. `supabase-schema.sql` 파일의 내용을 복사해서 붙여넣기
5. **Run** 버튼 클릭

## 2. 이메일 인증 설정

1. 좌측 메뉴에서 **Authentication** > **Providers** 클릭
2. **Email** 설정 확인
   - "Enable Email provider" 체크
   - "Confirm email" 옵션은 필요에 따라 설정 (OTP는 보통 확인 불필요)

## 3. 환경 변수 확인

`.env` 파일이 프로젝트 루트에 있는지 확인:
```
VITE_SUPABASE_URL=https://ahprgrnzklukdacfmbzu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 테스트

1. 앱 실행
2. 로그인 페이지에서 이메일 입력
3. 이메일로 받은 OTP 코드 입력
4. 로그인 성공 후 데이터가 Supabase에 저장되는지 확인

## 5. 데이터 확인

Supabase 대시보드에서:
- **Table Editor**에서 각 테이블 확인
- **Authentication** > **Users**에서 사용자 확인


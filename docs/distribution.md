# 공통 디자인 배포

`tokens/`, `styles/`, `assets/`, `ui/`가 정본이고 `dist/`가 완성본이다. 제품별 테마 선택이나 별도 기본 묶음은 없다. 라이트 기본값에서 다크 모드에 달라지는 의미 값만 덮어쓴다. 생성 CSS도 공통 선언 한 벌과 차이만 담는다.

## 수동 갱신

```sh
npm run build
npm test
npm run check
node scripts/export.mjs <소비자의-src/vendor/theme>
```

`manifest.json`은 모든 파일의 SHA-256과 목록 전체의 해시를 가진다. `exportDesign`은 원본과 기존 사본을 먼저 검증한다. 수동 수정·추가 파일, 심볼릭 링크와 정규화되지 않은 경로가 있으면 쓰기 전에 중단하고, 정상 사본이면 폐기된 파일·빈 폴더를 삭제한 뒤 새 파일을 쓴다. 여러 파일을 쓰는 도중의 디스크 장애까지 원자적으로 복구하지는 않는다.

## 자동 전달

1. `sync-consumers.yml`이 정본을 검사하고 ThinkFlow의 `build/repo-design-tokens`에 내보낸다. 문법 안내·예제 그림도 재생성한다. 이전 갱신 브랜치가 남아 있으면 main을 병합 기록으로 잇고 내용은 main에서 다시 만들므로, 병합되지 않은 이전 갱신과 충돌하지 않고 PR 차이는 새 내보내기만 담는다.
2. ThinkFlow의 `design-update.yml`이 Node 20·22, 원본·그림·토큰과 Action 검사를 실행한다. 가져온 디자인과 생성 문서 이외의 변경이 있으면 자동 병합하지 않는다.
3. 사용자 명의 인증이 있고 검증한 PR 커밋이 그대로이며 main 변경을 포함했을 때만 squash 병합한다. 뒤이어 `sync-homepage.yml`을 실행한다.
4. ThinkFlow는 같은 디자인과 자신의 고정 커밋 의존성을 홈페이지 갱신 브랜치로 전달한다. 홈페이지는 디자인 해시 일치·전체 빌드·테스트를 검사한다. 디자인 사본과 ThinkFlow 의존성 이외 변경은 자동 병합하지 않는다.
5. 갱신 PR을 검증한 커밋 그대로 병합한 뒤 사용한 갱신 브랜치를 정리한다. 실패를 우회하거나 강제 푸시하지 않는다.

정본 저장소에는 `DAPHNIS_DEPLOY_KEY`, ThinkFlow에는 `HOMEPAGE_DEPLOY_KEY`를 둔다. 비밀 값은 코드·문서·로그에 쓰지 않는다. 공개 소비자는 커밋된 사본을 사용하므로 비공개 정본 접근 권한 없이 빌드한다. 호스팅 도메인 연결은 홈페이지의 별도 설정이다.

소비자 두 저장소의 `DESIGN_AUTOMATION_TOKEN`은 해당 저장소만 선택한 사용자 명의 fine-grained PAT이다. Contents와 Pull requests의 Read and write 권한을 사용한다. 토큰이 없으면 기본 Actions 토큰으로 검증된 PR까지만 만들고 자동 병합은 하지 않는다. 사용자 명의 인증을 나중에 등록하면 이전 봇 작성 PR을 닫고 사용자 작성 PR로 대체한다. 일반 사용자 인증이나 광범위한 토큰을 저장소에 복사하지 않는다.

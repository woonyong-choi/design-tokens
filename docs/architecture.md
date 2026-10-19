# 아키텍처

design-tokens는 여러 소비자가 공유하는 토큰, 아이콘, CSS, 정적 HTML 구성 요소와 브라우저 동작의 정본이다. 값과 UI 구조는 이 저장소에서 정의하고 소비자는 콘텐츠와 서비스 정책을 연결한다.

## 코드 지도

| 위치 | 책임 |
|---|---|
| `tokens/` | 공통 기본값과 다크 모드의 의미 값 차이 |
| `styles/`, `assets/` | 공통 웹·도표 CSS와 아이콘·자산 |
| `ui/` | 신뢰 경계가 있는 HTML 조각·패턴·레이아웃과 공통 런타임 |
| `scripts/lib/` | 토큰 참조, CSS 평탄화와 생성 |
| `scripts/build.mjs` | 정본을 읽어 배포물을 만들거나 일치를 검사 |
| `dist/` | 커밋하는 전체 생성물. 수동 수정 금지 |
| `scripts/lib/diagram-package.mjs` | 전체 생성 결과에서 도표 선택 정책과 메타데이터 생성 |
| `scripts/build-diagram-package.mjs`, `artifacts/diagram.tgz` | npm pack으로 도표 선택 패키지 생성·검사와 커밋하는 tarball |
| `test/` | 참조·대비·구성 요소·산출물·축소 계약 검사 |

## 한 방향의 생성

1. `scripts/build.mjs`가 `tokens/`, `styles/`, `assets/`, `ui/`를 읽고 `dist/`를 생성한다.
2. 소비자는 생성물을 포함한 commit을 Git 의존성으로 설치하고 패키지 진입점에서 읽는다.
3. 소비자의 정적 빌드는 페이지에 쓰인 CSS와 스크립트를 축소한다. 소비자가 만든 페이지나 축소 파일을 정본으로 역수입하지 않는다.

토큰은 DTCG의 `$type`, `$value`와 경로 참조를 사용한다. 색은 hex 문자열이고 치수·시간은 값과 단위를 가진 객체다. DTCG 색 객체 전체를 구현했다고 표시하지 않는다.

`dist/manifest.json`은 생성 파일과 내용 해시를 기록한다. `npm run check`와 시험이 원본에서 다시 만든 결과와 비교하는 이 저장소의 검사 자료이고, 소비자에게 사본을 전달하거나 사본 해시를 비교하는 데 쓰지 않는다.

도표 전용 배포는 같은 `buildDesign(root)` 결과를 순수 선택 함수에 넘긴다. 선택 정책은 사람·서비스 브랜드와 기존 UI·상태만 담는다. 별도 토큰이나 UI 정본을 만들지 않으며 전체 `dist/`에 쓰지 않는다. 선택 manifest는 선택 파일만 해시하고 패키지의 `designTokensProfile.sourceContentHash`는 전체 manifest를 가리킨다. 배포 범위와 재생성 계약은 [도표 전용 tarball](distribution.md#도표-전용-tarball)에 기록한다.

## 경계

공통 HTML은 텍스트와 URL을 검증하고, HTML 슬롯에는 명시적으로 신뢰한 출력만 받는다. 브라우저에서 React나 템플릿 엔진을 실행하지 않는다. 향후 프레임워크 래퍼가 필요해도 토큰과 구조의 정본을 복제하지 않는다.

검색 색인·라우팅·공개 승인·댓글 서비스·문서 메타데이터는 홈페이지에 남는다. Torso의 도형 배치와 DSL 의미는 Torso가 소유한다.

## 불변 조건

- 토큰 값과 CSS 역할은 정본에 한 번만 정의한다.
- 생성물은 원본에서 재생성하며 해시와 CI로 일치를 검사한다.
- 기존 소비자의 렌더러 계약은 사용처 확인 없이 삭제하지 않는다.
- 일반 텍스트와 검증된 HTML 슬롯을 구분한다.
- 다른 저장소에 파일을 밀어 넣는 자동 전달을 두지 않는다. 각 저장소는 자기 파일만 검사한다.
- 불필요한 시안·감사 사본은 활성 소스나 배포물에 포함하지 않는다.

## 배포 경로

소비하는 앱이 고정 commit을 고르고 Torso·document-engine은 앱이 설치한 같은 패키지를 peer 의존성으로 읽는다. [공통 디자인 배포](distribution.md)에 진입점과 갱신 절차를 기록한다. 태그 릴리스는 별도이며 main 병합이 npm 발행을 뜻하지 않는다.

## README 흐름 그림

[그림 원본](assets/build-flow.torso)은 디자인 원본, 빌드, 패키지, 소비 앱을 네 단계로 보여 준다. 생성한 SVG를 직접 고치지 않고 원본과 함께 갱신한다.

생성 도구는 Torso의 `14e57b7b274ac791f46d6c7827acf17686a983ed` 커밋이다. 해당 소스와 의존성을 준비한 뒤 이 저장소 루트에서 실행한다. `TORSO_PATH`는 준비한 Torso 저장소 경로다.

```sh
node "$TORSO_PATH/src/cli.js" check docs/assets/build-flow.torso --strict
node "$TORSO_PATH/src/cli.js" render docs/assets/build-flow.torso --static --strict
```

같은 버전으로 다시 생성했을 때 `docs/assets/build-flow.svg`의 바이트가 같아야 한다. README에서는 정지 그림으로 표시하며 단계별 책임은 위 코드 지도와 생성 절차를 따른다.

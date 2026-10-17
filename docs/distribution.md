# 공통 디자인 배포

`tokens/`, `styles/`, `assets/`, `ui/`가 정본이고 `dist/`가 생성물이다. 제품별 테마 선택이나 별도 기본 묶음은 없다. 라이트 기본값에서 다크 모드에 달라지는 의미 값만 덮어쓴다. 생성 CSS도 공통 선언 한 벌과 차이만 담는다.

## 패키지

소비자는 이 저장소를 고정 commit의 Git 의존성으로 설치한다. 어느 commit을 쓸지는 소비하는 앱이 정한다. 아래 `<commit>`은 검증한 전체 commit SHA로 바꾼다.

```sh
npm install --save-dev 'github:woonyong-choi/design-tokens#<commit>'
```

```json
{
  "devDependencies": {
    "@woonyong-choi/design-tokens": "github:woonyong-choi/design-tokens#<commit>"
  }
}
```

`dist/`를 Git에 커밋하므로 설치 때 빌드하지 않는다. `install`·`prepare` 같은 설치 스크립트를 두지 않고 `files`는 `dist`와 `LICENSE`만 담는다. `test/package.test.js`가 `npm pack`한 결과를 빈 소비자 폴더에 설치해 진입점, CSS 경로 해석과 검사 명령을 확인한다.

| 진입점 | 내용 |
|---|---|
| `@woonyong-choi/design-tokens/css`, `/js`, `/json` | 토큰 CSS·모듈·DTCG 원본 |
| `@woonyong-choi/design-tokens/components`, `/diagram`, `/svg`, `/icons`, `/build/styles` | 구성 요소, 도표 부품, SVG 검증, 아이콘 카탈로그, CSS 축소 |
| `@woonyong-choi/design-tokens/<dist 안 경로>` | `dist/` 아래 모든 파일. 예: `ui/index.mjs`, `styles/tabs.css`, `assets/icons/catalog.json` |
| `design-tokens-check` | 하드코딩 검사 명령(`dist/ui/build/check-tokens.mjs`) |

토큰만 쓰는 앱은 `/css`, 공통 구성 요소의 모양도 쓰는 앱은 `styles.css`와 `tokens.css`를 함께 읽는다. CSS가 참조하는 `assets/`의 상대 경로도 유지한다. 파일 경로는 패키지의 `exports`를 통해 찾는다.

```js
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const stylesPath = require.resolve('@woonyong-choi/design-tokens/styles.css');
const tokensPath = require.resolve('@woonyong-choi/design-tokens/css');
```

파일을 읽는 소비자는 경로를 직접 조립하지 않고 `createRequire(import.meta.url).resolve('@woonyong-choi/design-tokens/<경로>')`로 찾는다. 하드코딩 검사는 `design-tokens-check <대상> --tokens node_modules/@woonyong-choi/design-tokens/dist/tokens.json`으로 실행한다.

## 소비자 구성

| 소비자 | 선언 | 이유 |
|---|---|---|
| Torso | `peerDependencies` 범위 + `devDependencies` 고정 commit | 그림은 호스트 앱이 설치한 같은 디자인을 읽고, 자체 시험·그림 생성은 고정 commit으로 한다 |
| document-engine | `peerDependencies` 범위 + `devDependencies` 고정 commit | 기본 테마는 호스트 앱이 준 디자인을 쓴다 |
| homepage | `devDependencies` 고정 commit | 사이트가 디자인·Torso·문서 엔진의 버전을 함께 정한다 |

`peerDependencies`의 범위는 `package.json`의 `version`(semver)과 비교한다. Git으로 설치한 패키지도 이 값을 가지므로 앱이 고른 commit 하나가 모든 부품에 공유된다. 범위를 벗어나는 호환 변경은 `version`을 올려 알린다.

## 갱신

1. 이 저장소에서 `npm run build`, `npm test`, `npm run check`가 통과한 commit을 main에 병합한다.
2. 각 소비자가 `npm install --save-dev github:woonyong-choi/design-tokens#<commit>`으로 고정 commit을 바꾸고 자기 시험·검사·화면 검수를 실행한 PR을 만든다.
3. 소비자는 자기 저장소의 파일만 검사한다. 디자인 파일 사본, 해시 매니페스트 비교, 다른 저장소로 밀어 넣는 자동 전달은 없다.

이 저장소의 PR은 squash로 병합한다. 소비자가 PR 브랜치의 commit을 고정했다면 병합 뒤 main의 새 commit으로 다시 고정하고, 설치와 자체 검사를 실행한 PR로 갱신한다. 기존에 배포한 고정 commit은 소비자의 전환을 확인할 때까지 접근 가능하게 유지한다.

`dist/manifest.json`은 이 저장소의 생성물 검사(`npm run check`, `test/source.test.js`)가 쓰는 파일 목록과 SHA-256이다. 소비자 검사 기준이 아니다.

## 릴리스와 폐기한 자동 전달 설정

`v*` 태그는 `.github/workflows/release.yml`의 검사와 GitHub 릴리스를 실행한다. 태그와 `package.json`의 버전이 다르면 실패한다. `NPM_TOKEN`이 없으면 npm 발행만 건너뛴다. 일반 main 병합은 이 워크플로를 실행하지 않는다.

현재 Git 의존성 설치에는 자동 전달용 배포 키가 필요 없다. 저장소에 남아 있다면 `DAPHNIS_DEPLOY_KEY`(이 저장소), `HOMEPAGE_DEPLOY_KEY`·`DESIGN_AUTOMATION_TOKEN`(Torso), `DESIGN_SOURCE_SSH_KEY`·`ENGINE_SOURCE_REPOSITORY`·`ENGINE_SOURCE_SSH_KEY`·`DESIGN_AUTOMATION_TOKEN`(homepage)과 대응하는 deploy key를 지운다. npm 발행용 `NPM_TOKEN`은 태그 릴리스에서만 쓴다.

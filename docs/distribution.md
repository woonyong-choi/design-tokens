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

소비자는 Git에 커밋한 `dist/`를 읽는다. `install`·`prepare` 같은 설치 스크립트를 두지 않고 `files`는 `dist`와 `LICENSE`만 담는다.

`/build/styles`는 저장소에서 빌드한 PurgeCSS와 선택자 parser를 포함한다. 소비자에게 설치되는 런타임 의존성은 `esbuild`와 `postcss`다. 루트 override는 이 저장소의 빌드 입력만 고정하며 소비자에게 override 설정을 요구하지 않는다. 포함한 패키지의 이름·버전과 LICENSE 전문은 `dist/ui/build/styles.mjs`의 법적 주석에 남긴다.

`test/package.test.js`는 `npm pack` 결과를 override 없는 빈 소비자에 설치한다. 공개 `compileStyles`의 전체 CSS·토큰 축소 결과를 정본 함수와 비교하고, 진입점·CSS 경로·검사 명령·`npm ls --all`·`npm audit`를 확인한다. 이 검사는 로컬 패키지 설치 범위다. 소비자는 고정 Git commit 설치 뒤 자기 입력과 검사로 다시 확인한다. `npm audit`는 번들 내부를 검사하지 않으므로 `test/source.test.js`가 실제 번들 입력의 parser 수정 버전, lock 일치, LICENSE 전문과 생성물 해시를 별도로 확인한다.

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

전체 Git 패키지는 일반 SVG 49개와 브랜드 SVG 34개를 배포한다. `/icons`의 `getIconCatalog().brands`와 `readIcon`으로 전체 브랜드를 조회한다. 일반 도형·역할·별칭은 실제 사용 범위만 유지한다. `articles`는 기본 도움말 `question`만 유지하며 `kinds`는 빈 객체다. 제거된 이름과 별칭은 조회 오류다.

## 도표 전용 tarball

도표만 쓰는 소비자는 같은 정본에서 선택한 `artifacts/diagram.tgz`를 설치할 수 있다. 패키지 이름과 버전, Node.js 조건, 런타임 의존성과 검사 명령은 전체 패키지와 같다. 호스트 앱이 전체 패키지를 설치해 같은 이름의 peer 의존성을 충족하는 구성도 허용한다. 두 배포물의 토큰 값과 UI 구현은 같다.

```sh
npm install --save-dev 'https://raw.githubusercontent.com/woonyong-choi/design-tokens/<commit>/artifacts/diagram.tgz'
```

`<commit>`은 검증한 전체 commit SHA로 바꾼다. 이 주소의 설치와 고정은 소비자가 관리한다. tarball은 생성 시점의 전체 `dist/`를 수정하지 않는다. 전체 패키지의 `files`가 `dist`와 `LICENSE`만 허용하므로 tarball을 전체 패키지에 중첩해 배포하지 않는다.

| 범위 | 포함 내용 |
|---|---|
| 토큰 | `tokens.css`, `tokens.js`, `tokens.json`, `tokens.dark.json` |
| 도표 스타일 | `styles/diagram/**`, `styles/tabs.css`, `styles/toolbar.css`, `styles/diagram-embed.css` |
| UI | `ui/**` 원문 전체. `ui/icon-data.mjs`만 도표 조작 9개로 재생성 |
| 아이콘 | 사람 2개, 서비스 브랜드 5개, UI·상태 11개의 합집합인 canonical SVG 18개 |
| 카탈로그 | 선택한 아이콘·브랜드, 선택 대상의 별칭 4개, 조작 역할 9개. 분류·라이브러리와 모든 notice 경로 보존 |

사람은 `user admin`, 서비스 브랜드는 `nginx postgresql redis git github`를 선택한다. 상태는 `check warning close ellipsis`이고 조작 역할은 `copy download maximize-2 minimize-2 check alert zoom-in zoom-out scan`이다. 별칭 `admin administrator incident person`은 canonical 파일로 해석한다. 전체 패키지에서 이 선택 집합에 없는 도형은 이 tarball에서 제외한다. UI 안의 조작 SVG 9개와 원시 SVG 파일의 중복은 브라우저 렌더링과 Node 아이콘 읽기가 각각 쓰는 의도된 구성이다.

글꼴, 다른 이미지, 전체 웹 CSS와 전체 아이콘 카탈로그는 포함하지 않는다. 카탈로그의 `social`, `articles`, `kinds`는 빈 객체다. 따라서 원문 UI 파일을 포함하더라도 해당 역할이 필요한 홈페이지 구성 요소는 이 프로필의 지원 범위가 아니다. AWS 서비스 아이콘은 전체 패키지에만 있으며 이 tarball에는 없다. 선택 집합에 없는 이름은 `readIcon`이 거부한다. 전체 UI 원문은 소비자가 파일을 직접 읽어 브라우저 모듈을 조립할 수 있도록 유지하며 별도로 묶거나 축소하지 않는다.

새 AWS 아이콘을 도표 tarball에서 쓰려면 `scripts/lib/diagram-package.mjs`의 `POLICY.icons`에 이름을 명시하고 `npm run build:diagram`으로 다시 생성한다. 생성물을 포함한 새 commit의 전체 SHA로 소비자 설치 주소를 갱신한다. 전체 브랜드를 선택 집합이나 HTML 데이터에 자동 포함하지 않는다.

고정 export는 대상 파일이 있을 때만 남긴다. wildcard export는 선택한 `dist/` 파일만 노출한다. `package.json.designTokensProfile`은 `name: "diagram"`, 정렬한 canonical `icons`, 정렬한 조작 역할 `controls`, 전체 생성물의 `sourceContentHash`를 기록한다. 선택한 `dist/manifest.json`은 같은 스키마를 쓰며 자기 자신을 제외한 선택 파일의 SHA-256과 별도 `contentHash`를 기록한다. `sourceContentHash`와 선택 manifest의 해시는 서로 다른 범위를 나타낸다.

```sh
npm run build:diagram
npm run check:diagram
```

생성기는 `buildDesign(root)`의 결과에서 순수 함수로 파일을 선택한다. 전용 빌드 출력 영역에 선택 패키지를 쓰고 `npm pack --json --ignore-scripts`를 두 번 실행한다. 두 tarball의 바이트와 npm이 반환한 SHA-512 integrity를 확인한 뒤 정본 tarball을 저장한다. 검사 명령은 다시 생성한 바이트와 커밋한 tarball을 비교한다. CI는 Node.js 20과 22에서 이 검사를 실행한다. 설치 스크립트·개발 의존성·override는 선택 패키지 메타데이터에서 제외한다.

`test/diagram-package.test.js`는 선택 집합과 원문 보존, 누락 입력 거부, manifest, tar 경로·symlink, 전체 패키지 중첩 제외와 실제 tarball 설치를 검사한다. 새 소비자에서 SVG·별칭·조작 UI·도표 프레임·CSS 축소·검사 명령을 실행하고 `npm ls --all`과 `npm audit`를 확인한다. 브라우저 런타임의 import 경로는 실제 설치 파일을 번들러에 넣어 확인한다.

## 카드 미리보기

저장소에서 빌드했거나 다른 프로젝트에 패키지를 설치한 뒤 아래 명령을 실행한다. 카드 HTML과 두 CSS를 연결한 로컬 HTML 파일을 만든다. CSS의 원래 위치를 사용하므로 글꼴의 상대 경로도 유지된다.

```sh
node --input-type=module <<'JS'
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Card, CardGroup } from '@woonyong-choi/design-tokens/components';

const require = createRequire(import.meta.url);
const css = ['css', 'styles.css'].map(entry => {
  const path = require.resolve(`@woonyong-choi/design-tokens/${entry}`);
  return `<link rel="stylesheet" href="${pathToFileURL(path).href}">`;
}).join('\n');
const cards = [Card({
  title: 'Memory',
  href: 'https://example.com/docs/memory/',
  description: 'Address translation',
})];
const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Card preview</title>${css}</head>
<body>${CardGroup({ columns: 4, cards })}</body>
</html>`;
mkdirSync('.local', { recursive: true });
const output = resolve('.local/design-tokens-card.html');
writeFileSync(output, html);
console.log(pathToFileURL(output).href);
JS
```

출력된 `file:` 주소를 브라우저에서 열면 카드 한 개가 표시된다. 이 파일은 설치 확인용이다. 웹사이트에 배포할 때는 소비 앱의 정적 자산 경로에 CSS와 참조 자산을 함께 제공하고 `<link>`의 주소를 해당 공개 URL로 바꾼다.

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

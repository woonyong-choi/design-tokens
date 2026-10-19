<h1 align="center">design-tokens</h1>

<p align="center">
  정적 사이트와 도표 도구가 공유하는 디자인 토큰, CSS, 아이콘과 HTML 구성 요소<br>
  <a href="https://github.com/woonyong-choi/design-tokens/actions/workflows/ci.yml"><img src="https://github.com/woonyong-choi/design-tokens/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a><br>
  한국어 | <a href="README.en.md">English</a>
</p>

색·간격·서체 같은 디자인 값과 카드·탭 같은 HTML 구성 요소를 함께 제공합니다. 정적 사이트와 도표 도구가 같은 디자인을 쓰도록 토큰, CSS, 아이콘과 브라우저 동작을 한곳에서 관리합니다.

> [!NOTE]
> 개발 중입니다. 배포판은 없고 소스에서 빌드해 실행합니다.

<a id="install"></a>
<a id="compose"></a>

## 빠른 시작

Node.js 20 이상과 npm이 필요합니다. 도표만 쓰는 앱은 사람·서비스 브랜드와 기본 UI·상태 SVG 18개를 담은 [도표 전용 tarball 설치](docs/distribution.md#도표-전용-tarball)를 사용할 수 있습니다.

### 저장소에서 확인

저장소를 내려받은 뒤 루트에서 의존성을 설치하고 배포 파일을 만드세요.

```sh
npm ci
npm run build
```

카드 묶음을 HTML로 출력하세요.

```sh
node --input-type=module <<'JS'
import { Card, CardGroup } from '@woonyong-choi/design-tokens/components';

const cards = [Card({
  title: 'Memory',
  href: '/docs/memory/',
  description: 'Address translation',
})];
console.log(String(CardGroup({ columns: 4, cards })));
JS
```

결과는 `app-support-grid is-four` 카드 묶음 안에 `/docs/memory/` 링크를 가진 HTML입니다. 브라우저에서 표시할 때는 이 HTML과 패키지의 `tokens.css`, `styles.css`를 함께 연결하세요. CSS가 참조하는 글꼴·아이콘의 상대 경로도 유지해야 합니다. 브라우저에서 카드가 표시되는 전체 예제는 [카드 미리보기](docs/distribution.md#카드-미리보기)를 따르세요.

### 다른 프로젝트에 설치

아래 명령은 검증한 커밋을 Git 의존성으로 설치합니다.

```sh
npm install --save-dev 'github:woonyong-choi/design-tokens#1441d59721cea72a69a1e72b0ca3a3572b309ac3'
```

설치한 프로젝트에서도 위 HTML 예제를 실행할 수 있습니다. 커밋에 생성한 `dist/`가 포함돼 있어 소비자가 디자인 파일을 다시 빌드할 필요는 없습니다. 새 커밋으로 옮길 때는 [갱신 절차](docs/distribution.md#갱신)를 따르세요.

## 해결하는 문제

사이트의 카드와 도표의 조작부를 따로 만들면 같은 색·간격·탭 동작을 여러 곳에서 고쳐야 합니다. 이 패키지는 디자인 값과 HTML 구조, 공통 동작을 함께 공유합니다. 콘텐츠·URL·검색 색인·서비스 정책은 각 앱이 소유합니다.

공통 디자인을 쓰지 않는 독립 제품에는 그 제품의 구성 요소 체계가 더 적합합니다.

<a id="structure"></a>

## 작동 방식

1. `tokens/`, `styles/`, `assets/`, `ui/`에서 공통 디자인과 구성 요소를 정의합니다.
2. `npm run build`가 토큰·CSS·아이콘·HTML 모듈을 `dist/`로 생성합니다.
3. 소비하는 앱이 생성물을 포함한 커밋을 Git 의존성으로 고정합니다.
4. 앱이 패키지에서 HTML과 자산을 읽고 페이지에 연결합니다. 필요한 CSS와 브라우저 동작만 골라 빌드할 수 있습니다.

![디자인 원본을 빌드한 패키지를 각 앱이 고정 커밋으로 설치해 사용합니다](docs/assets/build-flow.svg)

입력부터 소비까지의 책임과 그림 재생성 방법은 [아키텍처](docs/architecture.md)에 있습니다. HTML 슬롯은 검증한 마크업만 받습니다. `trusted()`는 HTML을 정화하지 않으므로 입력 조건은 [공통 구성 요소](docs/components.md)를 확인하세요.

<a id="delivery"></a>

## 상태

| 구분 | 현재 상태 |
|---|---|
| 사용 가능 | 라이트·다크 토큰, CSS, 아이콘, 정적 HTML 구성 요소와 선택적 브라우저 동작 |
| 배포 | 생성물을 포함한 고정 커밋의 Git 의존성 설치 |
| 아직 없는 것 | GitHub 릴리스와 공개 npm 배포 |
| 남은 확인 | [검색 안내 문구의 라이트 화면 비교와 캡처 #11](https://github.com/woonyong-choi/design-tokens/issues/11) |

패키지 버전은 `0.1.1`입니다. 1.0 전에는 입력 형식과 구성 요소가 바뀔 수 있습니다. 소비자는 커밋을 갱신할 때 자체 검사와 화면 검수를 수행하세요. 이 저장소의 병합이 소비자 갱신이나 배포를 뜻하지는 않습니다.

<a id="documentation"></a>

## 문서

- [아키텍처](docs/architecture.md)
  - [공통 디자인 배포](docs/distribution.md)
  - [스타일 구조](docs/styles.md)
- [공통 구성 요소](docs/components.md)
  - [공통 아이콘](docs/design/content-icons.md)

[전체 문서](docs/README.md)

<a id="build"></a>

## 개발

정본을 변경하면 생성물도 함께 갱신하세요.

```sh
npm run build
npm test
npm run check
```

CI는 Node.js 20과 22에서 설치·시험·생성물 검사를 실행합니다. `npm run check`는 커밋한 생성물을 새 빌드 결과와 비교합니다. 변경 절차는 [기여 안내](.github/CONTRIBUTING.md), 표현 값과 CSS 변수 검사는 [스타일 구조](docs/styles.md#강제하는-것)를 따릅니다.

글꼴·외부 자산의 조건은 [출처와 라이선스](assets/sources.json)를 따릅니다.

<a id="license"></a>

## 라이선스

[MIT](LICENSE)

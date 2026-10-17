<h1 align="center">design-tokens</h1>

<p align="center">
  정적 사이트와 도표 도구가 공유하는 디자인 토큰, CSS, 아이콘과 HTML 구성 요소<br>
  한국어 | <a href="README.en.md">English</a>
</p>

토큰 값, 공통 스타일과 브라우저 동작을 한 저장소에서 관리합니다. 소비하는 앱은 콘텐츠와 경로를 제공하고, 이 패키지가 반환한 HTML과 CSS를 페이지에 연결합니다.

> [!NOTE]
> 개발 중입니다. 공개 릴리스는 없으며 커밋에 포함한 생성물을 Git 의존성으로 설치해 사용합니다.

## 목차

- [빠른 시작](#빠른-시작)
- [해결하는 문제](#해결하는-문제)
- [작동 방식](#작동-방식)
- [상태](#상태)
- [문서](#문서)
- [개발](#개발)
- [라이선스](#라이선스)

<a id="install"></a>

<a id="compose"></a>

## 빠른 시작

Node.js 20 이상과 npm이 필요합니다. 저장소 루트에서 의존성을 설치하고 카드 HTML을 출력하세요.

```sh
npm ci
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

출력에는 `app-support-grid is-four` 카드 묶음과 `/docs/memory/` 링크가 있습니다. 이 예제는 정적 HTML을 만들며 React나 브라우저 초기화가 필요하지 않습니다. 화면에 표시하려면 생성한 HTML에 패키지의 `styles.css`와 `tokens.css`를 연결하세요.

다른 앱에서는 검증한 commit을 Git 의존성으로 고정합니다. `dist/`를 함께 커밋하므로 설치 과정에서 디자인 파일을 다시 빌드하지 않습니다. [공통 디자인 배포](docs/distribution.md)에 설치 명령, CSS 경로와 갱신 절차가 있습니다.

CSS 축소 도구는 빌드에서 고정한 PurgeCSS와 선택자 parser를 포함합니다. 소비자 설치에는 `esbuild`와 `postcss`가 필요하며 별도 override 설정은 필요하지 않습니다. 저장소 루트 override는 빌드 입력에 적용됩니다. 패키지 시험은 override 없는 설치에서 CSS 축소 결과와 의존성 트리·audit을 확인하고, 번들 입력과 라이선스는 별도로 검사합니다.

## 해결하는 문제

사이트의 카드와 문서, 도표의 조작부를 각각 구현하면 같은 색·간격·탭 동작을 여러 곳에서 고쳐야 합니다. 이 저장소는 토큰과 HTML 구성 요소, 공통 브라우저 동작을 함께 제공합니다. 소비자는 공통 기본값을 상속하고 제품에 필요한 차이만 속성과 의미별 토큰으로 지정합니다.

콘텐츠, URL, 검색 색인과 서비스 정책은 소비자가 소유합니다. 공통 디자인을 공유하지 않는 독립 제품에는 그 제품의 구성 요소 체계가 더 적합합니다.

<a id="structure"></a>

## 작동 방식

1. `tokens/`에 공통 값과 다크 모드의 차이를, `styles/`에 공통 CSS를 정의합니다.
2. `ui/`의 구성 요소가 일반 텍스트와 URL을 검사하고 정적 HTML을 만듭니다. HTML 슬롯에는 구성 요소 출력이나 검증한 마크업만 전달합니다.
3. `npm run build`가 토큰, CSS, 아이콘과 UI 모듈을 `dist/`로 내보냅니다. `dist/manifest.json`에는 파일별 SHA-256을 기록합니다.
4. 소비자는 고정한 패키지에서 구성 요소와 자산을 읽습니다. `compileStyles`로 사용한 CSS를 남기고, `runtimeEntrypoints`로 페이지에 필요한 동작을 고릅니다.

`trusted()`는 HTML을 정화하지 않습니다. 안전한 렌더러가 만든 마크업에만 사용하세요. 입력 형식은 [공통 구성 요소](docs/components.md), 모듈별 책임은 [아키텍처](docs/architecture.md)에 있습니다.

<a id="delivery"></a>

## 상태

| 구분 | 현재 상태 |
|---|---|
| 사용 가능 | 라이트·다크 토큰, CSS, 아이콘 카탈로그, 정적 HTML 구성 요소와 선택적 브라우저 동작 |
| 배포 방식 | 앱이 고정 commit의 Git 의존성으로 설치. 이 저장소의 병합과 소비자 갱신·배포는 별도 |
| 지원 범위 밖 | 앱의 콘텐츠·라우팅·검색 색인·댓글 공급자와 Torso의 도형 배치·장면 시각 계산 |
| 남은 검증 | [검색 안내 문구의 라이트 화면 비교와 캡처 #11](https://github.com/woonyong-choi/design-tokens/issues/11) |
| 확인 범위 | 자동 검사는 입력·토큰 참조·대비·생성물 계약을 확인. 소비 화면의 시각 검토와 사용자 시험은 별도 |

패키지 버전은 `0.1.1`입니다. 1.0 전에는 입력 형식과 구성 요소가 바뀔 수 있으므로 소비자는 고정 commit 갱신 때 자체 검사와 화면 검수를 수행하세요. GitHub 릴리스와 공개 npm 패키지는 2026-10-17 조회에서 확인하지 못했습니다.

프로젝트 코드에는 MIT를 적용합니다. 글꼴과 외부 자산은 별도 라이선스와 고지를 따릅니다. 파일별 출처는 [자산 출처](assets/sources.json), 아이콘의 출처와 소비 계약은 [공통 아이콘](docs/design/content-icons.md)에 있습니다.

<a id="documentation"></a>

## 문서

- [아키텍처](docs/architecture.md): 코드 구조, 생성 흐름과 소유 경계
- [전체 문서](docs/README.md)

<a id="build"></a>

## 개발

정본을 변경하면 생성물도 함께 갱신하세요.

```sh
npm run build
npm test
npm run check
```

`npm run check`는 현재 생성물을 새 빌드 결과와 비교합니다. CI는 Node.js 20과 22에서 `npm ci`, `npm test`, `npm run check`를 실행합니다. 브라우저 검수 명령은 [스타일 구조](docs/styles.md#확인), 변경 절차는 [기여 안내](.github/CONTRIBUTING.md)에 있습니다.

직접 쓴 표현 값과 정의하지 않은 CSS 변수를 검사하려면 저장소 루트에서 실행하세요.

```sh
node ui/build/check-tokens.mjs styles ui --tokens tokens/tokens.json
```

위반은 종료 코드 1, 없는 입력이나 읽을 수 없는 토큰 정본은 종료 코드 2입니다. 예외는 같은 줄의 실제 주석에 사유를 적은 `tokens-allow:`만 인정합니다. [검사 범위](docs/styles.md#강제하는-것)에 허용 값과 런타임 입력이 있습니다.

[문서 색인](llms.txt)은 README의 소개와 문서 목록을 따릅니다. 원본의 제목, 소개나 문서 링크를 바꾸면 색인도 함께 갱신하세요.

<a id="license"></a>

## 라이선스

[MIT](LICENSE)

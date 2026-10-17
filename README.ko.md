# design-tokens

도표 캔버스는 본문과 구분되는 옅은 면을 유지합니다. 도형·그룹의 기본 윤곽은 `color.figure.outline`을 사용하며 카드와 캔버스에 대해 3:1 이상의 대비를 검사합니다.

[English](README.md) | 한국어

정적 사이트와 다이어그램 도구가 공유하는 디자인 토큰, CSS, 아이콘, HTML 구성 요소와 브라우저 동작을 관리합니다.

문서 앱은 시스템 조작부와 중립 표면에 `font.ui`, `text.tool`, `spacing.tool-icon`, `spacing.tool-target`, `spacing.toolbar`, `color.workspace.*`를 사용합니다. 이 역할은 본문 글꼴을 바꾸지 않습니다. 다크 카드는 제목·설명과 상호작용 상태에서 읽을 수 있는 공통 색을 사용합니다.

## 구조

| 경로 | 역할 |
|---|---|
| `tokens/` | 공통 값과 다크 모드의 차이 |
| `styles/`, `assets/` | 웹·도표의 공통 스타일과 아이콘 |
| `ui/` | 조립형 HTML 구성 요소, 선택적 동작과 빌드 도구 |
| `scripts/` | 검증과 빌드 |
| `dist/` | 커밋하는 생성물. 패키지 진입점으로 읽음 |
| `test/`, `examples/`, `docs/` | 계약, 실행 예제와 설계 문서 |

소비 저장소는 콘텐츠, 경로와 도메인 로직을 소유합니다. 재사용할 표현은 여기서 관리합니다. 소비자는 이 패키지를 설치해 쓰며 파일 사본을 두지 않습니다.

## 설치

고정 commit을 Git 의존성으로 설치합니다. commit은 소비하는 앱이 정하고 Torso와 document-engine은 앱이 설치한 같은 패키지를 peer 의존성으로 읽습니다.

```sh
npm install --save-dev github:woonyong-choi/design-tokens#<commit>
```

`dist/`를 커밋하므로 설치 때 빌드하지 않습니다. 이름 있는 진입점(`/css`, `/components`, `/icons`, `/svg`, `/build/styles`)이나 `dist/` 아래 파일 경로(`@woonyong-choi/design-tokens/ui/index.mjs`, `@woonyong-choi/design-tokens/styles/tabs.css` 등)로 가져옵니다. 하드코딩 검사는 `design-tokens-check` 명령입니다. 자세한 내용은 [공통 디자인 배포](docs/distribution.md)에 있습니다.

## 빌드

검사에는 Node.js 20 이상이 필요합니다.

```sh
npm ci
npm run build
npm test
npm run check
```

`dist/manifest.json`은 생성 파일 목록과 SHA-256입니다. `npm run check`와 시험이 새로 만든 결과와 비교합니다.

CSS 축소 도구는 PurgeCSS의 선택자 파서를 보안 수정 버전인 7.1.6으로 고정합니다. override가 필요한 이유와 제거 조건은 [스타일 빌드 계약](docs/styles.md#모듈과-생성)에 기록합니다.

표현값은 `node ui/build/check-tokens.mjs styles ui --tokens tokens/tokens.json`으로 검사합니다. CSS·스크립트와 마크업의 스타일·표현 속성을 검사합니다. 입력이나 토큰 정본이 없으면 종료 코드 2, 위반이 있으면 1로 실패합니다. 실제 주석의 `tokens-allow:` 뒤에 사유가 있을 때만 같은 줄을 예외로 인정합니다.

본문과 코드 글자는 테마의 의미 역할을 상속하며, 두 테마의 실제 페이지·코드 면 위에서 글자 대비를 검사합니다.

댓글 iframe은 밝은 토큰으로 생성한 글자 역할에 맞춰 OS 색상 설정과 관계없이 밝은 색상 체계와 공통 페이지 면을 사용합니다.

코드 블록과 도표는 블록 안의 같은 도구 막대를 사용합니다. 도구 막대의 별도 배경·테두리·그림자 없이 버튼을 블록 면에 놓습니다. 호버와 키보드 초점은 공통 강조색과 제어 배경을 쓰고, 누르는 동안만 active 상태를 적용합니다. 성공·실패는 조작 중에도 해당 상태색을 유지합니다. 결과를 알릴 때도 조작부 위치를 유지하며 버튼 아이콘·title과 화면 읽기 프로그램 알림을 사용합니다.

문서 탭과 도표 장면 탭은 개별 둥근 버튼인 `buttons` 기본값과 `text.body-text` 크기 기준을 공유합니다. `Tabs`와 `TabList`는 명시적인 `segmented`·`numbers` 옵션을 유지합니다. 빈 큐의 칸은 공통 `color.figure.queue-empty` 역할을 사용하며, 밝은 테마에서는 더 옅은 `color.gray.59`를 참조합니다.

차트 갱신 겹침은 공통 `.fl-mark-pulse` 스타일을 사용합니다. 소비자는 좌표·계열 효과색·원래 선 굵기를 전달하고, 면·선·불투명도는 공통 역할이 정합니다. 가로 성장의 시작 방향은 공통 변형으로 표현하고, 소비자는 배치로 계산한 방향만 전달합니다. 밝은 계열의 점 윤곽도 인라인 획 덮어쓰기 대신 공통 색 입력으로 전달합니다.

본문 도표는 자연 글자 크기를 유지하고 가용 폭보다 넓으면 그림 안에서 가로로 스크롤합니다. 전체화면은 기존 fit·확대 조작을 유지합니다. 자세한 내용은 [도표 삽입 계약](docs/components.md)을 따릅니다.

탭과 태그의 조작 글자는 4.5:1 이상, 선택 탭은 비선택 면과 3:1 이상의 대비를 유지합니다. 숫자 탭은 두 테마 모두 무채색 선택 면과 별도의 글자색 역할을 사용합니다.

아이콘은 `assets/icons/<의미>/<이름>.svg`에서 편집하며 `icons` 안의 깊이는 최대 2단계입니다. 상세 도형은 같은 폴더에 `-detail` 이름으로 둡니다. [아이콘 계약](docs/design/content-icons.md)에 분류·출처·공통 로더를 정리했습니다. 이전 스프라이트·별도 조작 도형·크기별 사본은 배포하지 않습니다.

중성 아이콘 획은 테마의 전경색을 따릅니다. 색면과 불투명 표식은 각각의 토큰을 사용합니다.

SVG는 파일 이름이나 로더 API를 바꾸지 않고 두 직계 그룹에 색상·단색 표현을 함께 둘 수 있습니다. 공통 렌더러가 두 그룹을 모두 검증하고 한 표현 전체를 선택하며, 표식이 없는 SVG는 기존 변환을 유지합니다. 형식과 레퍼런스의 적용 범위는 [표현 계약](docs/design/content-icons.md#색상과-단색-표현)에 정의합니다.

[아이콘 설계 판정 기준](docs/design/content-icons.md#설계-판정-기준)은 의미·광학 균형·상세 묘사와 소비 화면 검수를 다룹니다. 시각 검토와 사용자 시험은 구분합니다.

공통 카탈로그는 글 형식 8개를 각각 아이콘 하나에 연결합니다. 소비자는 형식, 카테고리, `document` 순서로 하나를 선택하며, 카탈로그 변경만으로 소비자의 기존 조합이 바뀌지는 않습니다.

카탈로그에는 여러 소비자가 함께 쓰는 브랜드 표식만 둡니다. Torso 그림의 Git·PostgreSQL·Redis·NGINX와 공통 소셜 아이콘의 GitHub·LinkedIn입니다. 홈페이지 기술 로고처럼 한 소비자만 쓰는 기술 로고는 그 소비자가 소유합니다. 브랜드 배경과 작은 크기의 심벌은 기존 SVG에서 정리하고 변경 방식을 카탈로그에 기록합니다. NGINX와 Redis의 흰 표식은 컬러에서 불투명하게, 단색에서 음각으로 유지합니다. PostgreSQL 파랑은 다크 모드에서 대비를 보정합니다.

독자 제작 구독·후기 PNG는 바이트와 출처를 `assets/sources.json`에 보존합니다. `assets/`의 모든 파일은 이 파일에 출처·라이선스 기록을 가지며 `npm test`가 검사합니다. 이미지 `src` 슬롯으로 소비하며 공통 SVG 로더에는 넣지 않습니다.

## 조립

```js
import { Card, CardGroup, trusted } from '@woonyong-choi/design-tokens/ui/index.mjs';

const cards = [Card({ title: 'Memory', href: '/docs/memory/', description: 'Address translation' })];
const html = CardGroup({ columns: 4, cards });
```

구성 요소가 일반 텍스트와 URL을 검증합니다. HTML 슬롯은 구성 요소의 출력이나 안전한 렌더러가 명시적으로 신뢰한 마크업만 받습니다. 정적 HTML을 반환하므로 React와 hydration이 필요하지 않습니다. 페이지가 쓰는 기능의 동작만 포함하세요.

`EmailForm`은 `variant: 'form'`인 `Section` 안에서 구독 입력과 기본 POST 제출을 제공합니다. 전송 주소가 없으면 입력과 버튼을 비활성화합니다. `SiteHeader.logo`는 검증한 이미지나 인라인 SVG로 제목과 아이콘을 대신하며 홈 링크의 접근성 이름을 유지합니다. 기존 간격 토큰으로 홈 링크 안쪽에 좌우 여백을 둡니다. `Hero.icon`은 기존 이미지 슬롯을 사용합니다. 글자 이미지에는 `app-hero-wordmark`, 일반 로고 이미지에는 `app-hero-logo`를 선택하며 여백과 색을 공유합니다. 공식 Inter Display Black 파일과 OFL 고지는 글자 이미지 재제작 입력으로 제공하며 런타임 웹폰트는 추가하지 않습니다.

밝은 테마에서 홈 헤더와 `Hero`, 후기 구획은 기존 흰색 표면 역할을 사용합니다. 구독·푸터는 canvas 배경을 유지합니다. 홈 제목의 아이콘 자리는 글자 기준선에 맞추고 내부 SVG·PNG는 각각 가운데 놓습니다.

`SectionIntro`는 공통 제목 크기의 아이콘 자리를 유지합니다. 카탈로그 SVG는 `size: 'card'`인 `ContentIconImage`나 `ContentIcon`으로 조립하고 원본 PNG는 이미지 크기를 유지합니다. 카드·문서·블로그 글 제목은 어절 단위로 줄을 바꾸며 가용 폭보다 긴 한 어절의 넘침도 처리합니다. 문서 제목의 아이콘은 첫 줄에 놓이며 블로그 글 제목은 본문 폭을 모두 사용합니다.

Markdown 렌더러는 `Details.open()`과 `Details.close()`로 접기 블록을 조립하고, 요약이 있을 때 `Details.summaryOpen()`과 `Details.summaryClose()`를 사용합니다. `Details`도 같은 태그를 사용하며 소비자는 그 사이에 이미 분석한 인라인 콘텐츠와 중첩 블록을 렌더합니다.

블록 폭은 `width: 'content' | 'narrow' | 'wide'`로 지정하며 기본값은 `content`입니다. `contentWidth`는 제거한 `wide`·`size` 속성을 거부합니다. [구성 요소 입력 계약](docs/components.md#입력-경계)은 블록 폭과 재생기 비율·그림 격자 크기를 구분합니다.

공통 토큰은 `color`, `text`, `spacing`, `radius`, `font`, `font-weight`, `leading`, `duration` 등 Tailwind 이름을 사용합니다. 간격 단위는 4px입니다. `tailwind.css`는 같은 정본에서 Tailwind 4의 `@theme inline` 어댑터를 제공합니다. 소비자는 공통 기본값을 상속하고 달라지는 부분만 재정의합니다.

일반 글자는 `font.sans`, 코드는 `font.mono`를 사용합니다. Pretendard는 공식 동적 부분 집합 92개를 `unicode-range`로 등록해 브라우저가 페이지에 나온 글자가 든 조각만 내려받습니다. 글꼴 굵기는 `normal`, `medium`, `semibold`, `bold`로 고릅니다. 웹과 도표는 `color.ink`, `color.ui-muted`, `color.ui-card`, `color.syntax-*`를 공유하며 같은 역할의 제품별 별칭을 두지 않습니다. 값이 같아도 용도가 다른 항목은 독립적으로 유지합니다. 참조와 삭제 규칙은 [스타일 구조](docs/styles.md)를 확인하세요.

랜딩 기술 링크의 호버·초점 표면은 정사각형입니다. 영상 제어는 채운 원 안에 흰색 재생·일시정지 기호를 표시합니다.

`TextInput`은 모든 텍스트 입력의 단일 구성 요소입니다. 기본 모양은 분할 탭 묶음과 같은 면·곡률·높이이며 보이지 않는 이름표를 함께 만듭니다. `SearchBox`와 `EmailForm`도 크기·면·앞 아이콘 칸 변형으로 같은 구성 요소를 조립합니다. 안내 문구 색과 초점 링은 라이트·다크 모두 공통 토큰을 사용합니다.

`SearchBox({ combobox: false })`는 최초 HTML부터 추천 팝업 ARIA가 없는 검색 필드를 만듭니다. `ContentGroup({ collection: true })`는 묶인 콘텐츠에 목록 영역 간격을 적용합니다.

## 전달

소비자는 `npm install --save-dev github:woonyong-choi/design-tokens#<commit>`으로 고정 commit을 옮기고 자기 시험·검사·화면 검수를 PR에서 실행합니다. 사본 내보내기, 다른 저장소로 밀어 넣기, 해시 매니페스트 비교, 배포 키는 없습니다.

태그 기반 패키지 릴리스는 별도입니다. 웹사이트 갱신으로 태그를 만들거나 패키지를 발행하지 않습니다.

## 문서

설계 문서는 한국어입니다. [아키텍처](docs/architecture.md), [공통 구성 요소](docs/components.md), [전체 문서](docs/README.md)에서 시작하세요.

[공유 아이콘 예제](docs/design/content-icons.md#다이어그램)는 현재 Torso 문법과 내장 이름을 사용하며 SVG 재생성 명령을 포함합니다.

## 라이선스

프로젝트 코드는 [MIT](LICENSE)를 사용합니다. 글꼴과 외부 자산은 각각의 고지와 출처 정보를 유지합니다.

본문 표와 단축키 표는 같은 구성 요소를 씁니다. 짧은 설명의 읽기 폭을 지키고 긴 셀은 줄바꿈하며 키보드로 가로 이동할 수 있습니다. 데이터 면·이동 점·범례는 같은 범주 색상을 사용합니다.

도표 메시지는 `allow-same-origin` 없이 격리된 미리보기를 지원합니다. 등록된 도표 창과 같은 출처의 도표 URL을 확인한 뒤 테마와 높이를 교환합니다.
도표의 SVG·HTML 바탕은 `color.figure.canvas` 역할을 공유합니다. 카드·탭 선택값 목록은 소비자 입력 검사에서도 가져와 사용합니다.

`ProjectList({ title, projects })`는 프로젝트 카드와 관련 문서 링크를 함께 배치합니다. 콘텐츠·주소와 선택적인 신뢰된 아이콘 슬롯을 전달합니다. 자세한 형식은 [구성 요소 계약](docs/components.md#프로젝트-목록)을 참고하세요.

`BlogCard.commentsHref`는 글 링크 밖의 독립된 댓글 링크를 만든다.

도표의 순간 강조와 켜진 카드 면은 검색·도움말 hover와 독립된 `color.figure.flash`, `color.figure.active-surface` 역할을 사용합니다.

다크 카드와 페이지는 공통 면·제목·설명 역할을 사용하며, 호버·눌림 상태에서도 글자 대비를 유지합니다.

차트 성장 모양과 HTML 재생 스타일은 디자인 정본에서 공유하고, SVG의 장면별 시각 계산은 Torso가 담당합니다.

프로젝트 영상은 JavaScript 초기화 전부터 접혀 있습니다. JavaScript가 없어도 영상 링크의 조각 주소로 이동하면 기본 재생 컨트롤을 사용할 수 있습니다.

검색 결과의 `icon` 슬롯은 생략할 수 있습니다. `SearchMessage({ lines })`은 안내 줄을 중앙에 표시하며 소비자는 같은 영역에 재시도 버튼을 추가할 수 있습니다. 캔버스와 푸터 글자는 다크 의미 테마를 따릅니다.

랜딩 제목·설명·구역 표면은 다크 의미 테마를 따릅니다. 비활성 구독 입력과 버튼은 글자를 읽을 수 있게 유지하며 중립 색과 기본 비활성 동작으로 상태를 구분합니다.

다크 모드의 구독·푸터 캔버스는 기존의 한 단계 깊은 표면을 사용해 본문과 구역을 구분합니다.

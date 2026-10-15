# 스타일 구조

공통 토큰·구성 요소·CSS·런타임을 한 정본에서 조합한다. 소비자는 표시 값이나 구성 요소의 HTML을 다시 정의하지 않는다.

## 소유와 변경 순서

| 단계 | 위치 | 책임 |
|---|---|---|
| 토큰 | `tokens/tokens.json` | 색·글자·간격·곡률·시간 값과 기본값 참조 |
| 구성 요소 | `ui/` | 검증된 속성에서 HTML과 접근성 연결을 생성 |
| 스타일 | `styles/` | 클래스의 기본 모양과 맥락별 배치 |
| 동작 | `ui/runtime/` | 복사·탭·툴팁·문서 탐색·영상·흐름 |
| 콘텐츠 | 소비자의 설정과 Markdown | 제목·설명·링크·목록·노출 정책 |

값 변경은 토큰에서, 재사용 구조 변경은 구성 요소에서 처리한다. 페이지마다 같은 조각을 복사해 고치지 않는다. 상세 속성과 신뢰 경계는 [공통 구성 요소](components.md)를 따른다.

일반 글꼴은 `font.sans`, 코드 글꼴은 `font.mono`를 사용한다. 굵기는 Tailwind 이름인 `font-weight.normal`(400), `medium`(500), `semibold`(600), `bold`(700)로 고른다. 도표의 `figure-sans`·`figure-mono`는 내보내기에 포함하는 부분 글꼴의 등록 이름이며 웹 글꼴의 별칭이 아니다.

본문 글자는 `color.ink`, 보조 글자는 `color.ui-muted`, 중립 카드 면은 `color.ui-card`, 코드 구문은 `color.syntax-*`를 웹과 도표가 함께 읽는다. 같은 역할을 제품별 이름으로 다시 정의하지 않는다. 값이 같더라도 글자 크기·아이콘 크기·곡률처럼 따로 바뀌어야 하는 역할은 서로 참조하지 않는다. 웹 조작과 인라인 카드의 작은 모서리는 `radius.md`, 묶음 도움말 카드는 `radius.help-grouped-radius`, 설명 팝오버는 `radius.tooltip-radius`를 사용한다. 곡률에서 간격 토큰을 참조하지 않는다. 기본 간격 단계와 공통 본문 위계를 사용하거나 각 역할의 기본값을 정의한다.

미사용 판단에는 두 소비자의 JavaScript 참조, CSS 변수, 템플릿으로 조합하는 이름과 라이트·다크의 참조 경로를 포함한다. `color.paint`처럼 문법의 색 이름에서 변수를 만드는 역할을 단순 문자열 검색 결과로 삭제하지 않는다. 정의를 삭제하거나 이름을 바꾸면 생성물과 소비자 참조를 함께 갱신하고, 이전 이름을 호환용 별칭으로 남기지 않는다.

## 문서 앱 역할

`font.ui`는 시스템 UI 서체이며 문서 본문의 `font.sans`와 분리한다. 조작부는 `text.tool`(13px), `spacing.tool-icon`(16px), `spacing.tool-target`(28px), `spacing.toolbar`(40px)를 사용한다. 크기는 승인된 데스크톱 앱 설계값이며 Things의 측정값이 아니다. 터치 환경의 목표 크기를 이 값으로 제한하지 않는다.

`color.workspace.sidebar`, `document`, `toolbar`는 탐색·문서·도구 표면이다. `hover`와 `selected`는 중립 상태 면이고 글자는 `color.ink`를 사용한다. 모두 기존 회색 단계를 참조하며 라이트·다크에서 본문과 탐색 영역을 구분한다. 소비자는 제품명으로 별도 팔레트를 만들지 않는다. 이 토큰은 기존 웹 구성 요소의 모양을 자동으로 바꾸지 않는다.

다크 카드의 면은 `color.ui-card`, 제목은 `color.ink`, 설명은 `color.body`를 읽는다. 선택과 눌림의 배경에서도 글자 대비를 유지한다. grouped와 related 카드는 다크 모드에서 자체 중립 면을 가져 밝은 페이지 안에서도 글자가 사라지지 않는다. 페이지 배경과 일반 링크색은 바꾸지 않는다. 카드 배경을 공유하는 문서 목차의 호버·선택 글자는 `color.document-nav-active-ink`로 분리해 같은 배경에서 읽히게 한다.
검색 입력 글자는 웹 본문과 같은 `color.body`를 사용한다. 브라우저 기본 입력 색에 의존하지 않아 라이트·다크 모두 본문 위계를 유지한다.

## 모듈과 생성

`styles/index.css`는 `styles/*.css`를 순서대로 가져온다. 기본 요소는 base·shell·tabs·toolbar·table·controls·forms·icons·search·cards·prose·media, 맥락 배치는 article·support·blog·landing·features·pages가 소유한다. 한 클래스의 정본은 한 모듈에 두고 다른 모듈은 부모 맥락에서만 재정의한다.

빌드는 로컬 CSS import를 평탄화한다. 외부·절대 경로, 폴더 탈출, 순환·중복 import와 조건부 import는 거부한다. `url()`은 배포 CSS 기준 `./assets/...`를 사용한다. `breakpoint(이름)`은 토큰 값으로 바뀐다. 웹과 도표는 `styles/tabs.css`를 함께 읽어 탭을 다시 정의하지 않는다.

소비자의 `compileStyles`는 전체 HTML·스크립트의 사용처, 동적 상태와 변수 참조를 보존한 뒤 축소한다. `:focus-visible`, 숨김 상태와 움직임 줄이기 규칙을 빠뜨리지 않는다. 배포물의 축소 결과를 정본 CSS에 역반영하지 않는다.

정본의 빌드 의존성은 PurgeCSS 7.0.2의 선택자 파서에만 `7.1.6` override를 적용한다. 기존 6.x 파서의 보안 결함을 수정하되, 다른 취약 전이 의존성을 추가하는 PurgeCSS 8.0.0은 사용하지 않는다. 상위 도구를 갱신할 때 `npm audit`, 전체 계약 시험과 실제 소비자 입력의 CSS·토큰 축소 결과를 확인하고, 보안 수정된 의존성 조합이 확인되면 override를 제거한다.

## 구성 요소 계약

| 구성 요소 | 스타일 계약 |
|---|---|
| SiteHeader, SiteFooter | `.app-shell`, `.app-header`, `.app-nav`, `.app-logo`, `.app-logo-brand`, `.app-footer` |
| EmailForm | `.app-newsletter`, `.app-newsletter-email`, `.app-newsletter-note` |
| Hero, Section, SectionIntro, QuoteCard | `.app-hero-copy`, `.app-hero-logo`, `.app-hero-wordmark`, `.app-landing-section`, `.app-landing-heading`, `.app-landing-icon`, `.app-interview-summary` |
| Card, CardGroup | `.app-help-card`, `.app-card-summary`, `.app-support-grid` |
| BlogCard | `.app-blog-card`, `.app-blog-card-link`, `.app-blog-card-body` |
| Tag, TagList | `.app-tag`, `.app-tags` |
| SearchBox, SearchResult | `.app-search-input`, `.app-search-entry`, `.app-search-result-link` |
| DocumentArticle, PostArticle | `.app-prose`, `.app-blog-post`, `.app-article-lead` |
| CodeBlock, CopyButton | `.app-code`, `.app-tool-header`, `.app-tool-label` |
| Table | `.app-table-scroll`, `.app-table` |
| Tabs, TabList, Gallery | `.app-tabs`, `.app-tablist` |
| Figure, Player | `.app-figure`, `.app-player` |
| Details, 문서 안내 | `.app-details`, `.app-callout` |
| DocumentNavigation, DocumentPager | `.app-document-nav`, `.app-related-grid` |

`Player`는 `.app-player` 안에 기본 `video` 요소를 출력한다. 재생 버튼은 `.app-player-button`, 로드 실패 안내는 `.app-video-error`로 구분한다.

`RemoteLink`의 재생 링크는 기본·호버·키보드 초점에서 밑줄 없이 공통 조작 면과 초점 표시를 사용한다. 헤더의 제목 이미지는 본문 글자 크기에 맞추고 히어로 제목 이미지는 원본 비율과 공통 제목색을 유지한다. 히어로 위 여백은 기존 위 여백에 작은 간격 한 단계를 더한다.

`SiteHeader.logo`의 `.app-logo-brand`는 기존 `spacing.1-5`로 좌우 안쪽 여백 6px을 둔다. 링크 배경과 제목 이미지 사이의 간격을 확보하며 일반 아이콘·텍스트 헤더에는 적용하지 않는다. 링크의 기본·호버 불투명도와 배경은 기존 상태 규칙을 따른다.

홈 발행 변형 `.app-publication.app-canvas`와 `Hero`, 후기 구획은 `color.ui-card`를 사용하며 밝은 테마에서 흰색이다. 후기 구획은 기본 `Section` 배경을 상속한다. 일반 `.app-canvas`와 구독·푸터는 기존 `color.canvas`를 유지한다. 홈 식별 클래스를 보존하므로 로고의 기본·호버 불투명도는 바뀌지 않는다.

기술 로고의 링크는 아이콘 크기에 양쪽 안쪽 여백을 더한 정사각형이다. 슬롯 가운데에 아이콘을 놓고 평소·호버·키보드 초점에서 같은 가로·세로 비율을 유지한다.

`SectionIntro`의 `.app-landing-icon`은 제목의 기준선에 놓인 공통 크기의 자리다. 직계 아이콘을 자리 안에서 절대 배치해 가운데 놓으므로 자식 SVG·PNG의 기준선 차이가 제목 줄 높이에 영향을 주지 않는다. 기존 아이콘 크기와 여백은 유지한다.

히어로의 일반 이미지 로고는 `.app-hero-logo`, 글자 이미지는 `.app-hero-wordmark`를 사용한다. 일반 이미지의 최대 폭은 `spacing.hero-logo-max`로 본문 폭의 75%를 유지한다. 글자 이미지는 `text.5xl`의 48px 높이를 기준으로 하며 `intro-compact` 이하에서는 기존 `text.heading`의 36px을 쓴다. 가용 폭 안에서 원본 비율을 유지하고 로고와 같은 제목색·아래 여백을 공유한다. `text.5xl`은 기존 `spacing.12` 기본 단계를 참조한다.

`assets/fonts/inter-display-black.woff2`는 글자 이미지 재제작 입력이다. 공식 [Inter 원본](https://github.com/rsms/inter/blob/353b61b9f4430d5f420d56605a6e7993e0941470/docs/font-files/InterDisplay-Black.woff2)을 그대로 보존하며 출처·해시는 `assets/sources.json`, OFL 1.1 고지는 `assets/fonts/inter-license.txt`에 있다. 이 파일은 웹폰트로 등록하지 않으며 일반 본문 글꼴은 바뀌지 않는다. Inter Display Black을 Things 로고의 실제 서체로 단정하지 않는다.

`SectionIntro`의 아이콘 자리는 `spacing.landing-icon`의 64px이다. 카탈로그 SVG는 그 안에서 기존 `ContentIcon` 카드 역할인 48px로 가운데 정렬하고, 원본 PNG는 64px 이미지 표시를 유지한다. 아이콘 도형과 원본 여백을 고치거나 이름별 CSS 배율을 만들지 않는다.

`Card`·`DocumentArticle`·`PostArticle` 제목은 `word-break: keep-all`로 한국어 어절을 지키고 가용 폭보다 긴 단어는 `overflow-wrap: anywhere`로 넘침을 막는다. 관련 글 제목은 기존 한 줄 말줄임을 유지한다. 문서 제목은 인라인 흐름에서 첫 줄에 아이콘을 놓고 `ContentIcon`의 기존 수직 정렬을 사용한다. 블로그 글 제목은 좌우 폭을 별도로 줄이지 않아 본문 폭을 모두 사용한다.

### 강제하는 것

토큰 검사기는 CSS·조작 SVG·UI 모듈·런타임의 직접 표현 값과 정의되지 않은 변수를 검사한다. `--anchor-x`, `--anchor-y`는 실제 요소 위치에서 계산하는 툴팁 좌표다. SVG 도형의 좌표나 원본 미디어 크기는 UI 토큰과 다른 콘텐츠 데이터다.

`node ui/build/check-tokens.mjs <대상> --tokens tokens/tokens.json`은 파일·폴더를 검사한다. 대상이 없거나 검사할 소스가 없거나 토큰 정본을 읽지 못하면 종료 코드 2로 실패한다. `--tokens`를 생략하면 현재 폴더와 상위의 `tokens.json`·`tokens/tokens.json`만 찾으며 `.git` 파일이나 폴더에서 멈춘다. 시험 fixture나 다른 저장소의 정본을 대신 고르지 않는다. 위반은 종료 코드 1, 위반 없는 검사는 0이다.

`var()` 이름은 선택한 토큰 정본, 검사기와 함께 배포된 공통 CSS의 선언, 아래 런타임 입력 계약에 있어야 한다. 소비자 파일에 선언을 추가해도 공통 변수로 등록되지 않는다. fallback이 있어도 이름의 오타를 검사하며, fallback 안의 중첩 참조도 검사한다. CSS 주석과 문자열의 가짜 선언은 등록하지 않는다. 정본에서는 `styles/`를, 배포본에서는 `styles.source.css`와 `styles/`를 검사기 위치 기준으로 읽는다.

| 런타임 입력 | 설정 주체와 값 | 생략 |
|---|---|---|
| `--anchor-x`, `--anchor-y` | `ui/runtime/document.js`가 툴팁 위치를 px로 계산 | 툴팁 표시 시 필수 |
| `--s` | ThinkFlow `chart/heatmap.js`의 칸 강도 0~1 | 열지도 칸에서 필수 |
| `--view-w`, `--panel-w` | ThinkFlow `html.js`, `player/play.js`의 단위 없는 SVG 폭 | 판 배치에서 필수 |
| `--figure-canvas` | ThinkFlow `html.js`의 넓은 캔버스 길이(px) | 기본 캔버스 토큰 사용 |
| `--bundle-w`, `--fit-w`, `--zoom` | ThinkFlow `player/view.js`의 묶음 폭·맞춤 길이(px)·확대 배율 | 문서 폭·100%·1 사용 |
| `--pill-tint` | ThinkFlow `player/stage.js`의 라벨 강조 강도 0~1 | 중립 상태 0 사용 |
| `--pulse-effect` | ThinkFlow `chart/pulse-overlay.js`가 전달하는 표식 계열의 효과색 | 갱신 겹침에서 필수 |
| `--pulse-width` | 같은 표식의 원래 선 굵기 | 면은 tag, 선은 edge 두께 사용; 글자 후광은 casing 사용 |
| `--chart-boundary` | ThinkFlow `chart/metrics.js`가 전달하는 밝은 계열의 점 윤곽색 | 차트가 놓인 면의 currentColor 사용 |

HTML·SVG·Vue·Svelte에서는 `style` 요소·속성과 색·글꼴·획·불투명도 등 표현 속성을 검사한다. 일반 글자·주소·도형 좌표·viewBox·미디어 원본 크기는 제외한다. 예외는 같은 줄의 실제 주석에 사유를 적은 `tokens-allow:`만 인정한다. 문자열 속 표기와 빈 사유는 검사를 끄지 않는다.

표현 속성의 이름 색, 색 혼합·라이트/다크 함수 안의 이름 색, 전환·애니메이션의 직접 이징, `font-weight` 키워드와 `%`·`deg`·`ch`를 포함한 크기 단위를 검사한다. 단위의 대소문자는 구분하지 않는다. 전체 크기·가운데 정렬·출발점에 쓰는 100%·50%·0%와 반대 방향 이동의 -100%·-50%는 허용한다. 일반 글자와 문법 안내의 색 이름·백분율은 표현 값으로 보지 않는다. JavaScript에서 이름을 조립하는 `var()`는 완성된 이름을 이 정적 검사만으로 검증할 수 없으므로 생성 결과 검사가 필요하다.

시험은 위 표의 클래스가 스타일 정본에 존재하는지, 텍스트·주소·HTML 슬롯의 신뢰 경계, 탭 ID와 역할 연결, 코드 구문 역할 및 대비, 생성물 일치와 CSS 축소를 확인한다. 홈페이지는 라이트를 선택하며 도표는 라이트·다크를 지원한다.

## 카드·태그·검색

도표 캔버스는 `color.figure.canvas`와 공통 카드 곡률을 사용해 본문과 구분한다. 도형의 기본 면과 외부 도형·그룹·관계선의 점선은 공통 CSS가 소유한다. 외부 도형의 도착 후광도 같은 점선을 유지하며, 생명선과 메모·격자 구분선의 별도 점선 역할은 보존한다. 도형은 `color.ui-card` 면을 유지하고 기본 윤곽·그룹 경계는 `color.figure.outline`을 사용한다. 두 테마에서 윤곽과 캔버스·카드 면의 대비를 3:1 이상으로 검사한다. 색을 지정한 윤곽과 재생 중 강조 역할은 유지한다.

카드 이미지·제목·설명은 글 링크에, 태그는 독립 링크에 둔다. 글 링크의 가상 요소가 카드 전체를 덮고 태그는 그 위에서 동작한다. 검색 결과도 태그 행과 여백까지 하나의 호버 영역이다. 수정키 클릭과 키보드 탐색은 일반 링크 동작을 유지한다.

태그는 카드·본문·검색에서 같은 13px 크기와 배경을 사용한다. 외곽선이 없으며 hover와 focus는 `color.tag-hover`와 `color.on-action`을 사용한다. 카드 태그는 한 줄을 넘으면 말줄임하며 키보드 초점이 이동하면 해당 링크를 볼 수 있다. 날짜·작성자·댓글의 노출 여부는 소비자 데이터가 정한다.

태그의 hover·focus와 탭 글자는 실제 합성 배경에서 4.5:1 이상, 탭 선택 면은 비선택 면과 3:1 이상의 대비를 유지한다. 일반·분할 탭은 `color.feature-tab-selected`와 `color.feature-tab-ink`를 함께 사용한다. 숫자 탭은 두 테마 모두 무채색의 `color.gallery-selected`와 `color.gallery-selected-ink`를 사용하며, 다크 모드에서 밝은 면과 어두운 숫자로 명암을 뒤집는다.

`CollectionHeader`는 제목 아래 돌아가기와 선택 보조 동작을 배치한다. 전체 보기·돌아가기·본문 이어 읽기는 `NavigationLink`의 글꼴·크기·색과 꺾쇠를 공유한다. 카드 열 개수는 묶음의 속성이고 바깥 컨테이너 폭과 분리한다. 홈페이지의 넓은 CS 4열·Tech 5열은 소비자의 구성이다.

영상 재생·일시정지 제어는 버튼 색을 따르는 채운 원과 흰색 기호를 사용한다. `ControlIcon`은 두 제어의 배색을 보존하고 다른 제어의 단색 변환을 유지한다.

## 본문과 코드

본문의 Markdown 표와 단축키 표는 `Table`과 `styles/table.css`를 공유한다. 면·글자·구분선은 카드와 같은 의미 토큰을 읽으며 문서가 지정한 열 정렬은 유지한다. 도표의 상태·범주·도형 색은 `color.category`의 같은 계열에서 역할별로 파생한다. 넓은 데이터 면에만 적용하는 별도 팔레트는 두지 않는다.

표는 내용의 고유 폭을 확보해 코드 옆의 짧은 설명이 한두 글자씩 세로로 눌리지 않게 한다. 긴 셀은 기존 본문 읽기 폭인 `container.body-width` 안에서 줄바꿈한다. 코드도 긴 식은 줄바꿈하되 공백·줄바꿈과 원문을 보존한다. 좁은 화면에서는 표 영역 안에서 가로로 이동하고 페이지 전체 폭은 늘리지 않는다.

본문은 `app-prose` 위계를 사용한다. `color.body`는 `color.ink`를 참조하므로 테마가 잉크 역할을 바꾸면 본문도 같은 글자색을 상속한다. 밝은 테마와 어두운 테마 모두 페이지 면 위 본문 대비를 검사한다. 코드의 기본 글자와 구문 역할도 다크 팔레트를 상속하며 인라인 코드와 코드 블록의 실제 면 위에서 대비를 검사한다. 본문 링크, 코드, 표, 인용문, 수식, 그림과 캡션이 공통 역할을 참조한다. 캡션·`small`·작은 안내 글자의 `color.prose-caption-color`는 `color.ui-muted`를 참조해 두 테마의 페이지 면 위에서 4.5:1 이상을 유지한다. Things의 캡션 색(`rgba(4,15,26,.5)`, 다크 `rgba(239,246,255,.49)`)은 페이지 면 위에서 약 3.6:1·4.1:1이라 이 기준에 못 미치므로 더 진한 보조 글자색을 쓰는 것은 의도된 차이다. 본문보다 작은 `text.post-date-size`와 낮은 대비로 본문보다 낮은 위계는 유지한다. 제목의 원래 단계는 `app-heading-N`으로 유지한다. 코드 구문 역할은 `SYNTAX_ROLES`와 `SyntaxToken`으로 연결하며 분석기는 소비자가 선택한다.

코드 블록과 도표는 `ToolHeader`, `Toolbar`, `ToolButton`을 조립한다. 코드·그림의 면 안쪽 오른쪽에 도구 막대를 두고 머리글이 버튼 높이를 차지하므로 콘텐츠와 겹치지 않는다. 아이콘은 공통 조작 자산, 44px 버튼·호버·초점은 `styles/toolbar.css` 하나가 정한다. 도구 막대와 확대 버튼 묶음은 별도 배경·테두리·그림자를 두지 않는다. 호버와 키보드 초점의 아이콘은 `color.accent`, 배경은 `color.control-hover`를 사용하고 누르는 동안만 `color.control-active` 배경을 적용한다. 초점 테두리를 유지하며 성공·실패의 상태색은 조작 중에도 덮지 않는다. 마우스에서는 블록 호버·키보드 초점·결과 알림 동안 보이고 터치에서는 항상 보인다. 복사와 다운로드의 대기·성공·실패·재시도·알림 초기화는 `bindToolbar`가 맡고 소비자는 원본과 다운로드 작업만 제공한다. 알림 시간은 `duration.notice`이다. 결과 문구는 `.app-sr`로 시각적으로 숨겨 도구 막대와 버튼의 크기·위치를 유지한다. 문구가 화면에 보이지 않아도 알림 동안 도구 막대를 계속 노출한다. `.app-sr`의 한 정의도 도구 막대 CSS에 포함되어 독립 도표와 전체 문서가 함께 사용한다.

삽입 도표의 높이·테마·대체 전체화면은 `bindDiagramHost`가 맡는다. 등록된 iframe의 출처와 메시지 송신자를 확인하고 전체화면 중에는 자연 높이 알림을 적용하지 않는다. Escape는 해당 재생기에 종료 요청을 보내고 종료 뒤 자연 높이로 돌아온다. 홈페이지와 갤러리는 같은 삽입 계약을 사용한다.

도표 재생기의 `.dp-panels`는 측정한 보기 폭을 유지하고 각 SVG는 판의 자연 폭으로 그린다. 가용 폭보다 넓은 도표는 `.fl-canvas` 안에서 가로로 스크롤하며 글자까지 화면 폭에 맞춰 축소하지 않는다. 문서의 세로 흐름과 장면·움직임은 유지한다. 전체화면에서는 기존 fit·확대 비율을 적용한다.

문서 계층과 목차의 폭·접힘·현재 항목은 공통 문서 구성 요소가 맡고, 계층·이전·다음·heading ID는 소비자가 전달한다. 댓글 iframe의 디자인은 공통 `assets/giscus.css`에 있고 공급자 URL·허용 도메인·연결 실패 처리는 홈페이지가 맡는다.

댓글 스타일은 light 토큰으로 생성한다. iframe 문서 루트에 `color-scheme: light`, `color.ui-card` 배경과 `color.body` 글자색을 함께 적용해 OS가 어둡게 설정되어도 light 토큰의 글자와 캔버스의 대비를 유지한다. 공급자의 `light dark` 메타 설정이 바탕만 어둡게 바꾸지 않도록 한다.

## 확인

`npm test`, `npm run build`, `npm run check`로 계약과 생성물을 검사한다. 구조·스타일을 바꾼 경우 소비자의 실제 검색·태그·복사·문서 탐색을 넓은 화면과 모바일에서 확인한다. 제공된 Things 기준에서 의도적으로 확장한 기능을 제거해 외형만 맞추지 않는다.

표의 렌더링 회귀 검사는 설치된 Chrome과 별도 `playwright-core` 모듈을 사용한다. `node test/table-browser.mjs <playwright-core의 index.mjs 경로>`로 모바일·데스크톱, 라이트·다크에서 설명 열·긴 코드·긴 문장·다열 표와 키보드 가로 이동을 확인한다. 선택적인 마지막 인수에 기록 파일의 경로 접두사를 주면 측정 JSON과 화면을 저장한다.

`node test/giscus-browser.mjs <playwright-core의 index.mjs 경로>`는 공급자와 같은 `light dark` 메타 설정의 독립 iframe에서 OS light/dark와 두 화면 폭의 댓글·답글·입력란 대비 및 키보드 초점을 확인한다. 선택적인 마지막 인수에 기록 경로 접두사를 주면 JSON과 화면을 저장한다. 공급자의 실제 댓글 연결·펼침은 소비자 화면에서 따로 확인한다.

## 도표 정보 역할

도표 캔버스는 옅은 중립 면이고 카드는 별도의 면이다. 스키마와 격자의 경계는 상시 표시하며, 표 머리는 옅은 면으로 구분한다. 이름–값 카드 내부는 평소 여백과 정렬로 구분하고 값 갱신 때만 강조 면을 표시한다.

기본 강조는 파랑이며 다른 색은 작성자가 의미를 구분할 때 사용한다. 차트 면과 이동 라벨은 `color.category.*.solid/on-solid`에서 같은 색 쌍을 읽는다. 진한 면은 흰 글자, 밝은 노랑은 어두운 글자다. 별도 흐름 팔레트는 두지 않는다. 실제 계열의 점은 원이며 범례와 이름으로 구분한다. 목표는 `color.data.reference`의 중립색, 선형 차트에서는 점 표식 없는 점선이다. 스키마 내부 선·목표·신뢰구간은 축과 같은 `color.data.grid`의 옅은 회색이다. 히스토그램은 구간 폭과 기준선을 유지하고 위쪽 모서리에만 공통 작은 곡률을 적용한다.

검색 결과 페이지의 `SearchBox({ combobox: false })`는 처음 HTML부터 `searchbox` 역할을 사용하며 추천 목록 ARIA를 붙이지 않는다. 기본 추천 검색은 `combobox` 계약을 유지한다. `ContentGroup`의 `collection` 변형은 글 목록 절의 바깥 간격을 함께 소유한다.

기초 초기화와 초점 링은 `base.css`가 소유합니다. 일반 초점 링은 `outline-width.focus`와 `color.ui.focus`를 사용하며, 잘리는 내부 링크는 해당 구성 요소가 안쪽 오프셋만 지정합니다. 페이지 전체 스크롤바와 내부 도표 스크롤바는 각각 `spacing.scrollbar`, `spacing.figure-scrollbar` 역할을 사용합니다.

카드 변형 목록은 `CARD_VARIANTS`, 탭 변형 목록은 `TAB_FRAMES`·`TAB_POSITIONS`·`TAB_SELECTORS`를 가져와 입력 검사에 사용합니다. 페이지 이전·다음 링크는 공통 탐색 꺾쇠를 사용하므로 소비자가 라벨에 화살표 글자를 붙이지 않습니다.

도표의 바탕과 빈 화살촉·소멸 표식은 `color.figure.canvas`를 사용합니다. SVG 정지/움직임 층의 미디어 규칙도 `diagram/figure.css`가 소유합니다.

도표의 순간 강조는 `color.figure.flash`, 켜진 카드 면은 `color.figure.active-surface`를 읽는다. 검색·도움말의 hover 역할과 독립적으로 조정하며 라이트·다크 값은 토큰 정본에서 정의한다.

다크 도움말 카드의 기본 면은 `color.ui-card`, 제목은 `color.ink`, 설명은 `color.body`를 따른다. 그룹·관련 카드도 자체 다크 면을 갖는다. 목차의 호버·현재 항목 글자는 `color.document-nav-active-ink`를 읽고 일반 페이지의 `color.canvas`와 `color.action-link`는 바꾸지 않는다.

차트 갱신 겹침은 `fl-mark-pulse`와 `is-line`·`is-text`·`has-ring` 역할을 사용한다. 소비자는 원래 기하와 `--pulse-effect` 계열색, 필요할 때 `--pulse-width` 표식 두께만 전달한다. 면 투명도와 글자 후광 두께는 정본 CSS가 정한다.

가로 성장의 기준점은 `.grow`가 왼쪽, `.grow.from-end`가 오른쪽이다. 소비자는 계산된 진행 방향만 변형으로 넘긴다. 히스토그램의 실제 축 기준점처럼 배치가 계산한 좌표는 소비자가 전달한다.

공통 도구 막대의 바탕은 사용하는 면이 소유한다. 코드 블록은 `color.prose.pre-background`, 도표 전체 면은 `color.figure.canvas`를 사용한다. 일반 카드·탭·탐색의 전환은 `ease.reveal`을 사용하며 아이콘 전용 역할을 빌리지 않는다.

큐의 빈 칸·찬 칸과 카드 내용 면도 `figure.css`가 칠을 소유한다. 소비자는 같은 칸 윤곽을 재사용하고 값에 따른 칸 수와 표시 시각만 정한다.

프로젝트 영상의 초기 접힘은 CSS가 소유한다. 초기화 클래스 없이 숨기고, 재생 후에는 기존 has-played 상태로 연다. 스크립트가 실행되지 않으면 명시적 영상 링크의 :target에서만 기본 컨트롤을 표시한다.

랜딩의 제목·설명·후기 보조 글자·구독 안내와 구역 표면은 다크 의미 토큰을 사용한다. 구독 입력의 placeholder는 ui-muted, 활성 버튼 글자는 control-paper를 사용한다. 비활성 입력·버튼은 전체 투명도로 글자까지 흐리지 않으며 버튼을 ui-line 표면과 body 글자로 구분한다.

다크 canvas는 prose-pre-background를 참조한다. 본문의 ui-card와 구독·푸터의 구역 차이를 유지하며 새 색을 만들지 않는다.

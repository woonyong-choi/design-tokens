# 공통 아이콘

유형 선택과 시각적 합격 판정은 [아이콘 유형별 설계·검수](../../assets/icons/AGENTS.md)를 따른다. 기본 외곽 유형 하나, 해당하는 모든 추가 유형, 공통 필수 조건을 함께 적용한다. Things 웹 원본의 측정값은 비교를 시작하는 근거이며 공식 규격이나 자동 합격 범위가 아니다. 이 문서는 소스·카탈로그·표현·렌더러의 구현 계약과 기술 의미의 근거를 관리한다. 기준 변경 전 관찰은 새 유형별 검수를 대신하지 않는다.

## 기술 로고의 선택과 보존

기술 이름은 해당 프로젝트·재단·제작자가 배포한 로고로 표시한다. 공식 배포본 안에서 배경 없는 심벌과 평면형을 우선 선택하고 원래 색·도형·비례를 보존한다. 같은 표시 크기에서 실제 도형의 크기와 중심을 비례 변환으로 맞춘다. 독자 제작 콘텐츠 아이콘의 Things 조형 규칙을 기술 로고의 재디자인 지시로 적용하지 않는다.

이 카탈로그의 `brands`에는 Torso 그림이 내장 아이콘으로 쓰는 Git·PostgreSQL·Redis·NGINX와 공통 `SocialIcon`·`SiteFooter`가 쓰는 GitHub·LinkedIn만 둔다. 각 항목은 원배포 출처와 선택한 변형·원본 해시를 `assets/icons/catalog.json`의 `brands`에 기록한다.

한 소비자만 쓰는 기술 로고는 그 소비자가 소유한다. 홈페이지 기술 줄과 문서의 C·C#·Python·TypeScript·JavaScript·Kotlin·Kubernetes·Docker·Node.js·Spring·Linux 로고는 homepage 저장소의 `content/assets/brands/`와 `config/assets.json`이 출처와 고지를 가진다.

쓰는 곳이 없던 나머지 기술 로고와 그 출처만 기록하던 Simple Icons·Devicon 라이브러리 항목, Kafka 로고의 Apache-2.0 고지는 두지 않는다. Devicon 고지는 기술 키워드 수집본(`keyword-icons`)의 고지로 남는다.

새 기술 로고는 실제로 쓰는 소비자에 추가하고, 여러 소비자가 공유할 때만 이 카탈로그에 둔다. `test/asset-provenance.test.js`가 `brands`를 공통 소셜 역할과 Torso 내장 그림의 표식으로 제한하고, 카탈로그가 가리키지 않는 고지 파일을 거부한다.

정본 SVG 이름·경로·viewBox를 유지한다. 임시·구형·레거시 SVG나 소비자별 복제본을 design-tokens 저장소에 남기지 않는다. 원배포 다운로드·비교 캡처·실패 시안은 저장소 밖의 검수 영역에서만 다룬다. 기본형·상세형과 `npm run build`가 생성하는 `dist/`는 기존 계약을 따른다.

원본 도형을 다시 그리지 않는다. 기존 렌더러가 지원하지 않는 색 표현을 정적 벡터로 변환했다면 원래 도형·팔레트·그라디언트 함수와 변환 사실을 기록하고, 같은 크기의 원배포 렌더와 픽셀·시각 대조한다. 이 호환 변환을 원본 파일의 바이트 그대로라고 설명하지 않는다. 출처·권리 고지는 `assets/icons/licenses/project-logos.txt`를 따른다.

아이콘 원본은 `assets/icons/<의미>/<이름>.svg` 한 곳에서 편집한다. 홈페이지와 Torso는 같은 배포본과 렌더러를 사용한다. `icons` 안의 깊이는 의미 폴더와 파일까지 2단계다. 이 제한은 홈페이지 원고에는 적용하지 않는다.

도표 전용 tarball은 사람 `user`·`admin`, 서비스 브랜드 5개와 기존 UI·상태만 선택한다. 선택하지 않은 정본 SVG와 전체 카탈로그는 유지한다. 선택 범위와 설치 계약은 [도표 전용 tarball](../distribution.md#도표-전용-tarball)을 따른다. `admin`과 `administrator`는 `user-settings`를 가리킨다. 두 표현의 사람 머리·몸통은 `user`와 같고 중앙 톱니는 관리자 구별 표식이다.

## 고치는 곳

| 대상 | 위치 |
|---|---|
| 기본 도형 | `assets/icons/<의미>/<이름>.svg` |
| 상세 도형 | 같은 폴더의 `<이름>-detail.svg` |
| 원본 비트맵 | `assets/icons/communication/newsletter.png`, `testimonials.png` |
| 자산 출처·라이선스·해시 | `assets/sources.json` |
| 분류 설명·별칭·역할·브랜드 출처 | `assets/icons/catalog.json` |
| 외부 원본 고지 | `assets/icons/licenses/*.txt` |
| 색·표시 크기 | `tokens/tokens.json`의 `icon` 역할 |
| 배치·조립·안전한 SVG 삽입 | `styles/icons.css`, `ui/patterns.mjs`, `ui/svg.mjs` |

파일 이름은 소문자 kebab-case이고 카탈로그 전체에서 고유해야 한다. 기존 `-mono` 이름은 참조 호환성을 위해 유지하고, 상세 대안은 `-detail`을 사용한다. 색상과 단색을 따로 그려야 할 때는 같은 SVG 안의 두 표현 그룹을 사용한다. 크기별 폴더나 SVG를 변환한 PNG 사본은 만들지 않는다. 별칭은 검색어와 이름 해석을 연결하며 기존 직접 이미지 경로를 대체하지 않는다. 도형이 같다는 이유로 기존 경로를 삭제하지 않는다.

구독·후기 PNG는 독자 제작물이며 기존 경로와 128×128 RGBA 형식을 유지한다. 빌드는 현재 바이트를 그대로 내보내며 소비자는 기존 이미지 `src` 슬롯을 사용한다. SVG 카탈로그·`readIcon`에는 넣지 않는다. 현재 제작 출처·크기·SHA-256과 교체 전 Things URL·해시는 `assets/sources.json`에서 분리한다. 교체 전 원본 파일은 저장소와 배포본 어디에도 두지 않고 URL·해시만 `comparison-only` 기록으로 남긴다. 현재 독자 제작물에는 저장소의 MIT 라이선스를 적용한다.

## 자산 출처 기록

`assets/`와 `dist/assets/`의 모든 파일은 `assets/sources.json`의 기록 하나에 대응한다. 단일 파일은 `file`, 같은 출처를 공유하는 묶음은 `files` 경로 패턴으로 적는다. `origin`은 `project-original`, `third-party`, `catalog`, `license-notice` 중 하나이고 `license`는 비울 수 없다. `third-party`는 원배포 `https` URL을 가지며 `catalog`는 `icons/catalog.json`의 라이브러리·브랜드 출처와 `icons/licenses/` 고지를 따른다. `sha256`·`bytes`를 적은 기록은 현재 파일과 일치해야 한다.

출처나 라이선스 기록이 없는 그림과 Things 웹사이트(culturedcode.com)에서 가져온 파일은 두지 않는다. `-io50`·`-io70`·`-io80`, `fancysection-`, `arrivals-`, `bezel-` 같은 해당 사이트의 파일 이름 형식도 저장소에 두지 않는다. `previousSource`는 교체 전 원본의 URL·해시 기록이며 같은 해시의 파일이 저장소에 없을 때만 유지한다. `test/asset-provenance.test.js`가 이 계약을 `npm test`에서 검사한다.

재생·일시정지는 기존 컬러 표현으로 검수한다. 필수 조작부는 기본·누름·재생 상태의 실제 불투명도와 인접색으로 대비를 검사한다. 기호 주변에 대비 경계를 추가한 경우 실제 작은 크기에서도 기호와 틈이 남아야 한다. 한 상태에서의 개선이 다른 상태의 대비를 낮추면 통과시키지 않는다.

## 의미별 분류

| 폴더 | 찾을 대상 |
|---|---|
| `documents/` | 책·문서·메모·보고서 등 읽고 기록하는 자료 |
| `programming/` | 소스 코드·개발 도구·언어·버전 관리 |
| `algorithms/` | 흐름·분기·반복·문제 해결 절차 |
| `data-structures/` | 노드·트리·스택·큐 등 데이터 조직 |
| `databases/` | 데이터베이스·스키마·관계·질의 |
| `networking/` | 통신망·연결·무선 신호·네트워크 구성 |
| `operating-systems/` | 운영체제·터미널·시스템 실행과 관리 |
| `computer-architecture/` | 프로세서·회로·논리 게이트·컴퓨터 하드웨어 구조 |
| `memory-management/` | 메모리·캐시·RAM |
| `concurrency/` | 동시 실행·동기화 |
| `files-io/` | 파일·폴더·저장 장치의 입출력과 관리 |
| `backend-api/` | 서버·API·HTTP·백엔드 서비스 |
| `actions/` | 일반 명령·선택 결과·상태·찾기·확인 동작 |
| `navigation/` | 이동·방향·탐색·경로 안내 |
| `editing/` | 글자·그림·도형·색·선택 영역 편집 |
| `layout/` | 화면·패널·목록·표·입력 요소의 배치 |
| `devices/` | 컴퓨터·전화·주변기기·전자 기기 |
| `media/` | 사진·영상·음악·오디오와 재생·촬영 |
| `communication/` | 메시지·메일·통화·알림·대화·공유 |
| `security/` | 인증·신원·권한·보안·보호 |
| `people/` | 사람·관계·직업·표정·몸짓·사용자 |
| `time/` | 시간·시계·달력·일정·기간 |
| `commerce/` | 결제·화폐·구매·사업·주문·배송 |
| `places/` | 장소·건물·지도·지리·랜드마크 |
| `transport/` | 이동 수단·교통·차량 부품 |
| `nature/` | 동식물·날씨·천체·지형·환경·에너지 |
| `food/` | 음식·음료·식재료·조리와 식기 |
| `health/` | 신체·의료·질병·위생·돌봄·건강 |
| `sports/` | 운동·스포츠·경기·놀이·게임 |
| `objects/` | 가구·의류·생활용품·작업 도구·물리 사물 |
| `symbols/` | 기호·추상 도형·장식·표지 |
| `brands/` | 이름이 특정 서비스·제품·브랜드를 가리키는 표식 |
| `analytics/` | 통계·차트·측정·추이·데이터 시각화 |
| `science/` | 수학·화학·물리·실험·과학 측정 |
| `religion/` | 종교 상징·성전·의례·신앙 |

브랜드 로고는 이름으로 특정 제품·서비스를 가리킬 때만 선택한다. 일반 글의 주제를 나타낼 때는 해당 의미 폴더를 쓴다. 원배포 고지와 색·도형을 보존하고 공식 변형 선택·비례 확대·호환 변환은 카탈로그의 `treatment`에 기록한다. PostgreSQL은 공식 3색형을 사용하며 배경에 따라 임의로 명도를 바꾸지 않는다.

GitHub 원본은 공식 Invertocat 도형과 검정·흰색 변형을 `icon.brand.github`에 연결한다. 정적 배포 SVG는 아래 빌드 계약에 따라 검정으로 고정되므로 원본의 다크 토큰만으로 어두운 배경 적합성을 보장하지 않는다. 기존 단색 API는 호출자의 `currentColor`를 따른다.

LinkedIn과 NGINX는 공식 SVG에서 독립 심벌 그룹을 선택하고 워드마크·별도 등록 기호를 아이콘 칸에 넣지 않는다.

제공된 수집본 전체의 고지는 `licenses/collected-icons.txt`에 있고, 파일별 원 제공자가 확인되지 않은 항목을 특정 라이브러리나 자체 제작물로 단정하지 않는다.

## 빌드와 사용

`npm run build`가 의미 폴더를 읽어 배포 카탈로그의 `icons` 목록을 생성한다. 소스 JSON에는 개별 SVG 파일 목록을 다시 적지 않는다. `getIconCatalog().icons`에서 빌드한 목록을 읽는다. 빌드는 잘못된 깊이, 중복 이름, 없는 별칭·역할·고지, 미해결 토큰과 허용하지 않은 SVG를 거부한다. 좌표와 도형 내부 획은 원본 기하이고 화면의 표시 크기와 일반 아이콘 색은 공통 토큰을 따른다. 브랜드 컬러는 원배포 자산의 식별 색을 유지한다.

현재 빌드는 `dist/assets/icons` SVG와 역할용 `dist/ui/icon-data.mjs`의 색 변수를 밝음 값으로 치환한다. 어두운 토큰으로 원본을 직접 렌더한 그림은 이 정적 배포 결과와 다를 수 있다. 검수는 실제 빌드 SVG도 밝고 어두운 소비 배경에 놓고 수행한다. 필수 외곽·연결에는 양 배경의 대비를 확보하는 고정 중성 역할 `icon.structure-edge`를, 밝은 물체 안의 필수 기호에는 인접색을 확인한 고정 잉크 역할을 사용한다. 기존 테마값 전체를 바꾸거나 소비자 CSS로 결함을 가리지 않는다.

```js
import { getIconCatalog, iconFile, readIcon } from '@woonyong-choi/design-tokens/icons';
import { renderSvgIcon } from '@woonyong-choi/design-tokens/svg';
import { ContentIcon, trusted } from '@woonyong-choi/design-tokens/components';

const graphic = trusted(renderSvgIcon(readIcon('database')));
const icon = ContentIcon({ graphic, size: 'small' });
const path = iconFile('database', { variant: 'detail' });
const kinds = getIconCatalog().kinds;
```

패키지에서는 `@woonyong-choi/design-tokens/icons`와 `/svg`로 같은 함수를 가져온다. 파일을 읽는 `icons`는 Node 진입점이고 SVG 함수는 브라우저에서도 동작한다. `iconFile`은 `databases/database-detail.svg`처럼 카탈로그 루트 기준 상대 경로를, `readIcon`은 해당 파일의 SVG 문자열을 반환한다. `variant`는 `default` 또는 `detail`이며 상세 파일이 없으면 기본 도형을 쓴다. 모르는 이름·경로·변형은 오류다.

`ContentIcon`은 작은 문서 아이콘부터 카드까지 같은 배치를 쓴다. `kinds`는 글 형식에 대응하는 그래픽 이름을 제공한다. `ControlIcon`, `ArticleIcon`, `SocialIcon`, `ToolIcon`도 같은 카탈로그 역할을 조립한다. 브라우저용 모듈에는 공통 조작에 실제 필요한 도형만 넣으며 전체 라이브러리를 스크립트에 포함하지 않는다.

| 글 형식 키 | 용도 | 아이콘 |
|---|---|---|
| `concept` | 개념 설명·학습 정리·사용법 | `document` |
| `architecture` | 설계·아키텍처 | `hierarchy` |
| `experiment` | 실험·성능 비교 | `flask` |
| `troubleshooting` | 문제 해결·디버깅 | `bug` |
| `build` | 구현·리팩터링 | `code-block` |
| `review` | 코드 리뷰 | `code-review` |
| `retrospective` | 회고·변경 기록 | `change-history` |
| `project` | 프로젝트 소개 | `briefcase` |

글 아이콘의 소비 규칙은 형식, 대표 카테고리, `document` 순서다. 한 위치에 형식과 카테고리를 함께 붙이지 않는다. 이 선택은 소비자가 맡으며 카탈로그 변경만으로 소비자의 기존 배지 조합이 바뀌지는 않는다. 카테고리 카드는 카테고리 대표 이름을 직접 참조한다.

SVG 안의 mask ID는 삽입마다 분리한다. 결정적 출력이 필요한 빌드는 서로 다른 `prefix`를 전달한다. 스크립트·이벤트·외부 이미지·외부 URL은 허용하지 않는다. 원본을 직접 바꾸는 대신 화면별 도형이나 CSS 보정을 만드는 것은 금지다.

토큰을 직접 해석하는 원본의 중성 glyph는 `icon.neutral`을 따르고 다크 모드에서 밝은 값으로 바뀐다. 단색 렌더러가 내보내는 `currentColor`는 소비자의 전경색을 상속한다. 종이나 밝은 색면 안의 숫자처럼 어두운 잉크를 유지해야 하는 표식은 `icon.neutral-edge`를 사용한다.

NGINX는 공식 로고의 독립 N 심벌 도형과 고유 녹색을 보존한다. NGINX의 N과 Redis의 내부 흰 표식은 색상 표현에서 불투명하게 유지하며, 단색 표현에서만 음각으로 바꾼다. 흰 배경에서 같아 보여도 두 표현을 합치지 않는다.

공통 대비 검사는 테마별 중성 전경·브랜드 색 토큰의 페이지 대비 3:1, 어두운 잉크와 종이 사이 4.5:1 이상을 확인한다.

이 토큰 검사는 고정 원색을 쓰는 공식 PostgreSQL 로고의 실제 대비를 보증하지 않는다. 공식 자산은 실제 배경에서 별도로 시각 검수한다.

문서·편집기의 불투명한 밝은 표면은 `icon.sheet`, 흰 기호는 `icon.paper`를 사용한다. 두 역할을 분리해 표면색 보정이 흰 기호색을 바꾸지 않게 한다. 색 값의 정본은 [토큰 원본](../../tokens/tokens.json)이다.

### 색상과 단색 표현

불투명 종이면이나 흰 표식이 필요한 색상 도형과, 내부가 비어야 읽히는 단색 도형을 같은 파일에 둔다.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g data-name="color">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="var(--icon-sheet)" stroke="var(--icon-outline)"/>
    <path d="M8 8H16M8 12H16" fill="none" stroke="var(--icon-detail)"/>
  </g>
  <g data-name="monochrome" display="none">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor"/>
    <path d="M8 8H16M8 12H16" fill="none" stroke="currentColor"/>
  </g>
</svg>
```

`color`와 `monochrome`은 `data-name`의 예약값이다. 사용하면 두 그룹이 모두 있어야 하며 각각 루트 `svg`의 직계 `g` 하나여야 한다. `color`의 `display`는 생략하거나 `inline`으로 두고, `monochrome`은 `none`으로 둔다. 그룹 밖에는 `title`·`desc`만 둘 수 있다. 중첩·중복·한쪽 누락과 다른 위치의 `display`는 오류다.

일반 SVG 렌더러는 색상 그룹만 표시한다. 공통 `renderSvgIcon`과 `iconBody`는 기존 `monochrome` 옵션으로 한 그룹의 자손과 닫는 태그 전체를 선택하고 다른 그룹은 출력에서 제거한다. 선택 후 `data-name`과 `display`를 제거하므로 단색 그룹도 표시된다. `parseIconSvg`의 `body`는 색상 표현을 반환한다. 파일 이름·카탈로그 이름·공개 API는 바뀌지 않으며, `default`·`detail` 파일 선택과 색상·단색 표현 선택은 독립적이다.

렌더러는 숨겨진 그룹도 같은 규칙으로 전부 검증한다. ID는 파일 전체에서 고유해야 하고 mask는 같은 표현 안의 ID만 참조한다. 그룹 사이의 참조나 그룹 밖 공통 `defs`는 허용하지 않는다. 삽입 시 선택한 도형과 mask 참조에 같은 `prefix`를 붙인다.

단색 출력은 선택한 표현의 보이는 색을 `currentColor`로 바꾸고 mask 안의 흰색·검은색은 보존한다. 예약 그룹이 없는 SVG는 전체 도형에 기존 변환을 적용한다. 두 표현 그룹은 단색 변환을 위해 색상 도형의 불투명 면을 구멍으로 바꾸지 않도록 한다. 새 형식의 SVG와 이를 읽는 렌더러는 같은 빌드·배포본으로 전달한다.

### 디자인 근거와 적용 범위

Things의 [공식 기능 설명](https://culturedcode.com/things/features/)은 명료한 개념·콘텐츠 구조와 필요할 때 드러나는 세부 정보를 강조한다. [크기 조절 설명](https://culturedcode.com/things/blog/2023/09/things-big-and-small/)은 모든 아이콘의 벡터화와 문자·레이아웃의 동반 확장을 명시한다. [OS 26 설명](https://culturedcode.com/things/blog/2025/09/things-for-os-26/)은 익숙한 정체성을 유지하면서 곡률·여백·반응을 조정한 내용이다. 이 설명은 전체 아이콘에 같은 재질이나 배경을 적용하는 제작 규격이 아니다.

[지원 페이지](https://culturedcode.com/things/support/)의 아이콘에서는 밝은 불투명 면·흰 표식과 배경이 있는 그림·독립 실루엣을 관찰할 수 있다. 이는 원본 그림에서 확인하는 특징이며 공개된 수치 규격과 구별한다. 이 저장소의 기술 개념 도형과 색상·단색 분리는 해당 관찰을 참고한 독자 설계다. 지원 페이지의 원본 그래픽은 비교 자료로만 사용한다.

`icon.outline`·`icon.detail`·`icon.accent`·`icon.accent-soft`·`icon.accent-edge`와 `icon.sheet`의 색 값은 원본에서 관찰한 색을 바탕으로 정한 공통 역할이다. Cultured Code가 공개한 수치 규격이 아니며, 이 역할의 변경은 같은 토큰을 참조하는 아이콘 전체에 적용된다.

### 개발 문맥에서 도형을 고르는 순서

단어의 뜻과 사용처를 먼저 정하고, 개발자가 알아보는 구조를 골라 Things의 조형으로 다시 그린다. Things는 색면·곡률·기호 무게의 시각 기준이다. 기술 정의와 도식은 해당 분야의 공식 문서에서 확인한다. 기술 레퍼런스의 그림과 로고를 일반 아이콘에 그대로 복사하지 않는다.

홈페이지의 현재 참조 이름·변형·크기·배경을 읽기 전용으로 확인해 우선 목록을 만든다. 카탈로그에만 정의된 글 형식과 실제 화면에서 사용 중인 아이콘을 구분한다. 홈페이지 코드나 vendor를 바꾸지 않고 공통 원본에서 같은 이름의 SVG를 수정한다.

| 이름 | 표현할 뜻과 개발자 레퍼런스 | 남길 시각 특징 | 혼동을 막을 기준 |
|---|---|---|---|
| algorithm | 원하는 결과를 얻는 계산 가능한 절차. [NIST 정의](https://xlinux.nist.gov/dads/HTML/algorithm.html) | 절차가 이어지며 조건에서 경로가 나뉘는 흐름 | 분기 예시가 모든 알고리즘의 정의인 것은 아니다. 정적 조직도와 구별한다. |
| code | 언어 문법에 따라 명령과 표현식을 적는다. [MDN의 코드·함수](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions) | 코드의 괄호와 연산자를 주기호로 표현 | 언어 하나의 로고, 일반 문서, 실행 버튼과 구별한다. |
| cpu | 명령을 실행하는 중앙 처리 장치. [Intel의 프로세서 설명](https://www.intel.com/content/www/us/en/newsroom/tech101/client-computing/processor-guidebook-the-basics-from-cpus-to-asics.html) | 패키지·접점·채워진 연산 다이 | 칩의 실루엣만으로 CPU와 GPU를 완전히 구별했다고 주장하지 않는다. 카테고리 라벨을 유지한다. |
| network | 통신하는 장치와 장치 사이 연결. [Cloudflare의 인터넷 구조](https://www.cloudflare.com/en-ca/learning/network-layer/how-does-the-internet-work/) | 동등한 종단과 연결이 하나의 망을 이룸 | 부모·자식, 단일 입구의 요청 분배와 구별한다. |
| hierarchy | 소프트웨어를 상위 단위와 구성 요소로 나누는 구조. [C4의 컴포넌트 관점](https://c4model.com/diagrams/component) | 상위 모듈 하나와 구성 모듈의 단계 관계 | 조직의 사람을 나타내는 초상·계급 표식을 넣지 않는다. 순서도처럼 실행 방향을 강요하지 않는다. |
| server | 연결과 요청을 받아 작업을 처리하는 서버. [PostgreSQL의 클라이언트·서버 구조](https://www.postgresql.org/docs/current/tutorial-arch.html) | 하나의 장비 섀시와 구별되는 서비스 베이·입출력 부분 | 서버 역할은 하드웨어만 뜻하지 않는다. 원통 저장소·대기 카드와 구별하고 라벨로 역할을 명시한다. |
| database | 구조화된 데이터를 저장·조회·관리하는 시스템. [PostgreSQL의 구조](https://www.postgresql.org/docs/current/tutorial-arch.html) | 연속된 저장 원통과 층 | 파일 목록이나 분리된 동전 더미로 바꾸지 않는다. 원통은 소프트웨어 도식의 관례적 은유다. |
| brain-circuit | 모델을 학습하고 입력으로부터 추론하는 인공지능. [Google의 신경망 설명](https://developers.google.com/machine-learning/crash-course/neural-networks) | 인지의 은유인 뇌와 그 안에 연결된 연산 경로 | 뇌를 문자 그대로의 컴퓨터 구조로 설명하지 않는다. 일반 신경과학·챗봇 캐릭터로 축소하지 않는다. |
| layout | 브라우저 화면과 사용자 인터페이스의 구성 | 헤더·주 영역·보조 영역의 계층 | CPU 내부 격자와 구별한다. 단순 장식 격자보다 화면 구획이 먼저 읽혀야 한다. |
| cloud | 네트워크로 제공되는 컴퓨팅·운영 자원. [AWS의 인프라 구조](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html) | 클라우드의 관례적 구름 실루엣 | 날씨·백업·동기화·리전을 구름 하나로 모두 구별했다고 판단하지 않는다. 용도별 이름과 보조 특징을 유지한다. |
| lock | 접근을 제한하고 데이터·사용자를 보호하는 보안 개념 | 닫힌 고리와 잠금 몸체 | 로그인 성공·사용자 권한·VPN을 같은 잠금 하나로 대체하지 않는다. |

기술 개념을 더 다루는 경우에도 같은 의미 명세를 적용한다. `gateway`는 요청이 통과하는 진입점, `load-balancer`는 동종 처리 자원에 요청을 나누는 분배기, `proxy`는 요청자와 원 서버 사이의 중계자다. [Microsoft의 부하 분산 설명](https://learn.microsoft.com/azure/architecture/guide/technology-choices/load-balancing-overview)과 [Cloudflare의 동작 설명](https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/)에서 역할을 구분한다. 단순히 화살표 색이나 방향만 바꿔 세 의미를 만들지 않는다.

`cdn`은 지리적으로 흩어진 거점과 반복되는 콘텐츠, `dns`는 이름 조회와 대응 레코드가 핵심이다. DNS 도형의 사각형 개수를 주소 형식으로 설명하지 않는다. `secured-network`를 VPN에 쓸 때는 [AWS VPN 구조](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)처럼 보호되는 연결과 양쪽 종단이 남아야 한다. 방패·잠금만 남기면 일반 보안으로 의미가 축소된다.

`cache`는 [Redis의 캐싱 설명](https://redis.io/docs/latest/develop/clients/client-side-caching/)처럼 보관한 결과의 재사용을, `queue`는 [RabbitMQ의 큐 설명](https://www.rabbitmq.com/docs/queues)처럼 대기 항목과 서로 다른 입·출구를 표현한다. 큐의 FIFO 은유를 모든 메시지 시스템의 처리 순서 보장으로 일반화하지 않는다. `function`은 호출 가능한 실행 단위이며 호출 입구·실행 몸체·반환 또는 완료를 표현한다. 모든 함수에 명시적인 인자와 유의미한 반환값이 있어야 한다는 뜻은 아니다.

브랜드는 일반 개념의 대용물이 아니다. 실제 기술 이름을 표시할 때만 사용한다. [TypeScript의 기본 표식](https://www.typescriptlang.org/branding/)은 파란 면과 불투명 흰 글자이며 단색 음각은 별도 표현이다. [Kotlin의 브랜드 지침](https://kotlinlang.org/docs/kotlin-brand-assets.html)은 컬러를 기본으로 둔다. 원래 식별 면과 색을 없애는 것을 배경 제거·톤 통일로 잘못 해석하지 않는다.

### 설계 판정 기준

`cpu`를 칩으로 알아보는 것과 그 그림에서 컴퓨터 시스템 카테고리를 예상하는 것은 다른 판단이다. 중앙에 네 칸을 넣었다는 제작자의 설명만으로 CPU 의미를 전달했다고 판정하지 않는다. 패키지·접점·단일 연산 다이가 칩의 특징으로 읽히는지 확인하고, `layout` 같은 인접 아이콘과 혼동하는지도 확인한다. 작은 CPU 글자를 식별성의 근거로 삼지 않으며, CPU와 메모리의 정확한 구별은 보이는 라벨과 문맥으로 보완한다.

외부 지침은 의미 전달과 조형을 검토하는 근거로 사용한다. 출처별 대상과 설계 체계를 구분하며, 특정 제품의 수치나 미감을 이 저장소의 규격으로 복사하지 않는다.

| 근거 | 적용하는 원칙 | 적용 범위 |
|---|---|---|
| [NN/g의 아이콘 평가](https://www.nngroup.com/articles/how-to-test-digital-icons/)와 [아이콘 사용성](https://www.nngroup.com/articles/icon-usability/) | 형태 인식(recognition)과 문맥에서의 의미 해석(interpretation)을 분리하고, 친숙한 은유와 보이는 라벨로 의미를 전달 | 단독 도형의 식별과 실제 화면에서의 선택 과제를 별도로 검토 |
| [Dieter Rams의 디자인 원칙](https://www.vitsoe.com/gb/about/good-design) | 기능과 이해를 돕고, 핵심을 방해하는 불필요한 요소를 제거 | 색이나 묘사를 일괄 삭제하는 규칙이 아니라 각 요소의 역할을 설명하는 기준 |
| [Apple HIG의 Icons](https://developer.apple.com/design/human-interface-guidelines/icons) | 의미와 직접 연결된 은유, 일관된 묘사량·획 무게·시점, 광학적 중심 | 같은 캔버스 크기라도 도형의 비례와 여백을 조정해 시각적 무게를 검토 |
| [IBM Design Language의 UI icons](https://www.ibm.com/design/language/iconography/ui-icons/usage/) | 실제 사용 크기와 광학 정렬을 기준으로 제작 | IBM 고유의 단색 정책·획 수치·서체 비율과 이 저장소의 색면 표현을 구분 |
| [Material 2의 System icons](https://m2.material.io/design/iconography/system-icons.html), [Material 3의 Icons](https://m3.material.io/styles/icons/overview), [Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols) | M2 제작 규격과 M3 아이콘 체계를 구분하고, Material Symbols의 광학 크기 조정을 실제 크기 검수의 근거로 사용 | M2 수치와 M3 규칙의 혼용 금지, 비례 축소 결과에 대한 크기별 검수 |

Things는 색면·실루엣·묘사 밀도를 비교하는 시각 레퍼런스다. 전문가 지침은 의미와 사용성을 검토하는 근거다. 어느 쪽도 원본과의 유사도 수치나 전체 아이콘의 품질 승인을 대신하지 않는다.

색은 네 가지로 제한하지 않는다. 초록·빨강·파랑·노랑·회색·검정·주황·핑크 등 같은 톤의 팔레트를 쓰며, 채도·명도·면의 무게와 의미를 함께 비교한다. 트리·그래프는 중성 구조와 의미 있는 강조색을 조합한다. 기존 아이콘 색 역할을 우선 사용하고 새 색이 필요한 경우 공통 아이콘 토큰에 정의한다. 브랜드 고유색은 이 팔레트로 치환하지 않는다.

수정 전에 변경 설명에 의도한 의미(semantic intent), 실제 사용처, 혼동 대상, 의미를 전달하는 시각적 특징을 적는다. 색이나 도형을 선택한 이유는 관찰한 원본과 독자적인 판단을 구분한다. 기본형·상세형과 색상·단색은 같은 의미 정의를 공유한다.

| 이름 | 의도한 의미와 시각 근거 | 구별할 대상 |
|---|---|---|
| `cpu` | 연산 장치와 컴퓨터 시스템의 대표. 칩 패키지·접점과 단일 연산 다이의 위계 | 화면 격자, 메모리, 일반 회로 |
| `network` | 서로 연결된 단말의 통신. 동등한 연결 관계 | 부모·자식 계층, 한 입구에서 나누는 분배 |
| `server` | 요청을 처리하는 서버 장비. 장비 단위와 전면 구조 | 문서 목록, 저장 원통, 대기 항목 |
| `gateway` | 서로 다른 통신 영역 사이의 출입 지점. 경계와 통과 관계 | 일반 문, 자물쇠, 단순 이동 화살표 |
| `queue` | 순서를 가진 대기 항목과 입·출구. 항목의 순서와 이동 방향 | 단순 전송, 스택, 병렬 작업 |
| `event` | 사용처에서 정한 이벤트 또는 알림. 종은 알림의 근거로 사용 | 일정, 알람, 알림으로 전달되지 않는 프로그램 사건 |

`event`를 프로그램 사건에 사용할 때는 종이 그 문맥의 의미를 전달하는지 별도로 검토한다. 카테고리·탐색 라벨은 계속 보이게 두고, 호버 설명만으로 뜻을 보충하지 않는다. 라벨을 가리는 검수는 형태 인식을 확인하는 절차이며 실제 UI에서 라벨을 제거하라는 뜻이 아니다.

| 판정 항목 | 확인 방법 | 수정이 필요한 경우 |
|---|---|---|
| 외곽 실루엣과 의미 | 내부 장식과 색에 의존하지 않고 주체를 구별하며 인접 의미의 아이콘과 대조 | 제작자의 설명이 있어야 물체나 관계를 해석하는 경우 |
| 광학적 무게와 정렬 | 같은 역할의 아이콘을 같은 줄에 놓고 주체의 크기·빈 공간·배지 위치·문자와의 균형을 확인 | 같은 표시 크기에서 일부 도형만 과도하게 가볍거나 무겁고 중심이 치우치는 경우 |
| 색면과 선의 역할 | 주체·연결·표식·배경의 역할을 구분하고 색 없이도 필요한 관계를 유지 | 다른 의미를 색만 바꿔 구분하거나 연결선과 대상의 외곽을 혼동하는 경우 |
| 실제 크기 | 콘텐츠 아이콘을 24·32·48px, 조작부를 추가로 16·20px에서 렌더 | 구멍·간격·화살촉이 뭉치거나 세부 묘사가 주체보다 먼저 눈에 들어오는 경우 |
| 색상·단색 일치 | 두 표현에서 주체·방향·관계·상태를 대조 | 한 표현에만 처리 화살표나 데이터 계열을 추가해 핵심 의미가 바뀌는 경우 |
| 상세형의 추가 정보 | 추가한 요소가 설명하는 정보와 사용 크기를 명시 | 기본형에 점·줄·광택만 늘리고 새 정보가 없거나 축소 시 잡음이 되는 경우 |
| 실제 소비 장면 | 홈페이지 카테고리·글 목록과 Torso 노드·라벨·연결선·조작부에서 확인 | 독립 미리보기에서는 읽히지만 주변 글자·도형·상태와 겹치거나 위계가 무너지는 경우 |

색상·단색의 도형은 가독성을 위해 달라질 수 있지만 핵심 의미를 바꾸지 않는다. 상세형도 주체의 정체성을 유지하며 추가 정보를 전달한다. 기본형과 상세형의 차이가 사라지는 크기에서는 기본형을 사용한다. 이 선택을 위해 소비자별 SVG 사본을 만들지 않는다.

실제 사용 계약이 컬러 전용인 미디어 기호와 브랜드에 단색을 강제하지 않는다. 검수 기록에는 지원 표현과 실제 확인한 크기·배경을 명시한다. 필요한 조작 기호와 상태는 [WCAG 비텍스트 대비](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)의 인접색 대비 3:1을 확인한다. 제작자와 별도 검수자가 각각 관찰하며 필수 조건 하나라도 실패하면 재작업한다. 평균 점수나 빌드 통과는 시각적 실패를 상쇄하지 않는다.

정리는 같은 파일의 도형을 교체하는 방식으로 진행한다. 별칭은 이름 조회에만 적용되며 CSS와 문서의 직접 이미지 URL을 대신하지 않는다. 기본형·상세형·미검수 정본과 빌드 생성물은 레거시가 아니다. 구형 비교물은 현재 관찰·출처를 통합하고 의존하는 참조를 갱신한 뒤 제거한다. 파일 해시, 관련 색 토큰 또는 렌더러가 바뀌면 영향을 받은 관찰을 다시 확인한다.

## 다이어그램

Torso는 `icon=user`처럼 카탈로그 이름과 별칭을 직접 쓴다. 사용자 SVG가 필요한 경우만 `icons content "폴더"`와 `icon=content:user`를 쓴다. 도형의 측정·연결점·배치·경로 계산은 Torso가 맡는다.

[실행 예제](../../examples/content-icons.torso)는 `torso` 문법으로 `user`, `apigw`, `server`, `db`를 연결한다.

![공통 아이콘으로 표현한 요청 경로](../../examples/content-icons.svg)

```sh
TORSO_ROOT=/path/to/Torso
node "$TORSO_ROOT/src/cli.js" check examples/content-icons.torso --strict
node "$TORSO_ROOT/src/cli.js" render examples/content-icons.torso --strict --static
```

재생성 전에 Torso의 `@woonyong-choi/design-tokens` 개발 의존성을 같은 commit으로 맞춘다. 설치된 패키지 파일을 직접 수정하지 않는다.

## 변경 후 확인

`npm run build`, `npm test`, `npm run check`로 파일 목록, 원본·출력 연결, 역할·별칭, 외부 고지, 안전한 SVG 삽입을 확인한다. 실제 소비 화면에서는 설계 판정 기준에 따라 밝고 어두운 배경, 색상·단색, 기본형·상세형과 사용 크기를 대조한다. 호버·초점·복사 결과·배지 가독성과 Torso의 연결·애니메이션도 확인한다.

검수 기록에는 아이콘 이름, 소스 버전, 비교 근거, 크기·테마·표현, 사용 장면, 발견한 문제와 남은 한계를 적는다. 기준별 판단을 남기고 임의의 완성도 백분율이나 일괄 통과로 대체하지 않는다. 파일 검사·시각 검토·사용자 승인·병합·소비자 반영은 각각 구분한다. 일회성 검수 이미지와 기록은 제품 저장소에 쌓지 않는다.

에이전트나 제작자의 검토는 사용자 시험이 아니다. 사용자 시험에서는 대상 독자에게 이름 없는 그림의 형태를 설명하게 한 뒤, 실제 문맥에서 예상 의미와 선택 행동을 확인한다. 비교하는 시안의 위치와 라벨 조건을 유지하며 혼동과 선택 이유를 기록한다. 참여자 관찰 없이 인식률·과제 성공률을 주장하지 않는다. 사용자의 미적 선호 승인과 대상 독자의 의미 이해도도 별도로 기록한다.

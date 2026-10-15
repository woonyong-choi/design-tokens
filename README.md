# design-tokens

English | [한국어](README.ko.md)

Shared design tokens, CSS, icons, HTML components, and browser behavior for static sites and diagram tools.

Document apps use `font.ui`, `text.tool`, `spacing.tool-icon`, `spacing.tool-target`, `spacing.toolbar`, and `color.workspace.*` for system controls and neutral surfaces. These roles leave the document font unchanged. Dark cards share readable title, copy, and interaction colors.

## Structure

| Path | Responsibility |
|---|---|
| `tokens/` | Shared values and sparse dark-mode overrides |
| `styles/`, `assets/` | Shared web/diagram styles and icons |
| `ui/` | Composable HTML components, optional runtimes, and build helpers |
| `scripts/` | Validation, build, and verified export |
| `dist/` | Generated artifacts and file hashes |
| `test/`, `examples/`, `docs/` | Contracts, working examples, and design documentation |

Consumer repositories own content, routes, and domain logic. Reusable presentation belongs here. Do not edit exported files in a consumer.

## Build and export

Node.js 20 or later are required for the checks. This is a private repository; cloning or installing its Git package requires access.

```sh
npm ci
npm run build
npm test
npm run check
node scripts/export.mjs /path/to/consumer/src/vendor/theme
```

The exporter checks the previous manifest before replacing files, removes obsolete generated files and empty directories before writing the new paths, and refuses modified imports. A path can change between a file and a directory. The single bundle contains resolved tokens, CSS, assets, components, and a manifest of SHA-256 file hashes.

The CSS compiler pins PurgeCSS's selector parser to the patched 7.1.6 release. The [style build contract](docs/styles.md#모듈과-생성) records why this override is needed and when to remove it.

Run `node ui/build/check-tokens.mjs styles ui --tokens tokens/tokens.json` to audit presentation values. CSS, scripts, and markup styles and presentation attributes are checked. Missing inputs or token sources fail with exit code 2; violations fail with 1. Only an actual comment with a reason after `tokens-allow:` exempts its own line.

Body and code text inherit theme roles; text contrast is checked on the actual page and code surfaces in both themes.

Diagram canvases keep a separate muted surface from the document. Neutral shape and group outlines use `color.figure.outline`, checked at 3:1 or higher against both card and canvas surfaces.

The comment iframe uses the light color scheme and shared page surface regardless of OS appearance, matching its resolved light text roles.

Code blocks and diagrams share the same toolbar inside the block. The buttons sit directly on the block surface without a separate toolbar background, border, or shadow. Hover and keyboard focus use the shared accent and control background; pressing a button is a temporary active state. Success and failure keep their own colors during interaction. Feedback keeps the controls in place and uses the button icon and title with a screen-reader announcement.

Document tabs and diagram scene tabs share the `buttons` default with separate rounded buttons and the `text.body-text` size basis. `Tabs` and `TabList` keep explicit `segmented` and `numbers` options. Empty queue cells use the shared `color.figure.queue-empty` role, which references the lighter `color.gray.59` in the light theme.

Chart update overlays use shared `.fl-mark-pulse` styles. Consumers supply geometry, the series effect color, and the original stroke width; the shared roles own fill, stroke, and opacity. Horizontal growth uses shared start/end modifiers; consumers pass the direction determined by their geometry. Bright-series point outlines also use a shared color input instead of inline stroke overrides.

Inline diagrams retain their natural text size and scroll horizontally inside the figure when wider than the available space. Fullscreen keeps its fit and zoom controls. See the [diagram embed contract](docs/components.md).

Tab and tag interaction text keeps at least 4.5:1 contrast; selected tabs keep at least 3:1 against their track. Number tabs use neutral selected surfaces in both themes, with a separate foreground role.

Edit icons at `assets/icons/<meaning>/<name>.svg`, at most two levels below `icons`. Keep detailed variants beside the default file with a `-detail` suffix. The [icon contract](docs/design/content-icons.md) lists categories, sources, and the shared loader. Earlier sprites, separate control artwork, and size-specific copies are no longer shipped.

Neutral icon strokes follow the theme foreground. Color surfaces and opaque marks use their own tokens.

An SVG can keep color and monochrome presentations in two root groups without changing its file name or loader API. The shared renderer validates both groups and selects one complete presentation; unmarked SVGs retain the existing conversion. The [presentation contract](docs/design/content-icons.md#색상과-단색-표현) defines the format and reference boundaries.

The [icon design criteria](docs/design/content-icons.md#설계-판정-기준) cover meaning, optical balance, detail, and review in consuming interfaces. Visual review and user testing remain separate.

The shared catalog maps eight article formats to one icon each. Consumers select the format icon before the category icon and fall back to `document`; the catalog does not change a consumer's existing composition by itself.

The catalog keeps only brand marks shared by more than one consumer: Git, PostgreSQL, Redis, and NGINX for ThinkFlow figures, and GitHub and LinkedIn for the shared social icons. A technology logo used by one consumer lives in that consumer, such as the homepage technology logos. Brand backgrounds and small-size symbols are normalized in the existing SVG files. NGINX and Redis retain opaque white marks in color and cutouts in monochrome. The catalog records each treatment; PostgreSQL blue has a dark-theme contrast adjustment.

The project-original newsletter and testimonial PNGs keep their bytes and provenance in `assets/sources.json`. Every file under `assets/` has an origin and license record there, checked by `npm test`. Consume them through image `src` slots; the shared SVG loader remains SVG-only.

## Compose

```js
import { Card, CardGroup, trusted } from './vendor/theme/ui/index.mjs';

const cards = [Card({ title: 'Memory', href: '/docs/memory/', description: 'Address translation' })];
const html = CardGroup({ columns: 4, cards });
```

Plain text and URLs are validated by components. HTML slots accept only output from components or explicitly trusted markup from a safe renderer. The components return static HTML and do not require React or hydration. Include runtimes only when the page uses their feature.

`EmailForm` provides the newsletter input and native POST submission inside `Section` with `variant: 'form'`. Without an action, its input and button stay disabled. `SiteHeader.logo` accepts trusted image or inline SVG markup in place of the text title and icon while preserving the accessible home label. It adds horizontal space inside the home link with an existing spacing token. `Hero.icon` uses the existing image slot. Choose `app-hero-wordmark` for text artwork and `app-hero-logo` for other logo images; both share spacing and color. The official Inter Display Black file and OFL notice are included as artwork source inputs without adding a runtime webfont.

In the light theme, the homepage header, `Hero` and testimonials use the existing white surface role. The newsletter and footer retain the canvas background. Home heading icon slots align to the text baseline and center their SVG or PNG independently.

`SectionIntro` keeps an icon slot at the shared heading size. Compose catalog SVGs with `ContentIconImage` or `ContentIcon` at `size: 'card'`; original PNGs keep their image size. Card, document and blog post titles wrap at word boundaries, with overflow handling for a word wider than the available space. Document title icons stay on the first line; blog post titles use the full body width.

Markdown renderers compose collapsible blocks with `Details.open()` and `Details.close()`, plus `Details.summaryOpen()` and `Details.summaryClose()` when a summary exists. These are the same wrappers used by `Details`; consumers render their parsed inline content and nested blocks between them.

Block width uses `width: 'content' | 'narrow' | 'wide'`, with `content` as the default. `contentWidth` rejects the removed `wide` and `size` properties. The [component input contract](docs/components.md#입력-경계) distinguishes block width from player aspect ratio and figure grid size.

The common tokens use `color`, `text`, `spacing`, `radius`, `font`, `font-weight`, `leading`, `duration`, and related Tailwind namespaces. Its spacing unit is 4px. `tailwind.css` provides a Tailwind 4 `@theme inline` adapter from the same source. Consumers inherit the defaults and override only differences.

Use `font.sans` for text and `font.mono` for code. Font weights use `normal`, `medium`, `semibold`, and `bold`. Web content and diagrams share `color.ink`, `color.ui-muted`, `color.ui-card`, and `color.syntax-*`; there are no product aliases for those roles. Equal values with different purposes remain independent. See [style ownership](docs/styles.md) for the reference and removal rules.

Landing technology links have square hover and focus surfaces. Media controls use a filled circle with a white play or pause symbol.

`SearchBox({ combobox: false })` renders a search field without suggestion-popup ARIA from the initial HTML. `ContentGroup({ collection: true })` reuses collection spacing for grouped content.

## Delivery

A main-branch change validates and exports the common bundle to ThinkFlow. After renderer checks and a verified PR merge, ThinkFlow exports that exact bundle and its pinned renderer revision to homepage. Homepage checks both before merging its update PR. Each hop uses a repository-scoped deploy key. The two consumers must have identical design content hashes.

Tag-based package releases are separate. Website updates do not create tags or publish packages.

## Documentation

Design documentation is in Korean. Start with [architecture](docs/architecture.md), [shared components](docs/components.md), or the [document index](docs/README.md).

The [shared icon example](docs/design/content-icons.md#다이어그램) uses built-in names with the current ThinkFlow syntax and includes SVG regeneration commands.

## License

Project code uses [MIT](LICENSE). Fonts and external artwork retain their own notices and source metadata.

Document and keyboard shortcut tables share one component. Tables keep short explanations readable, wrap long cells and scroll horizontally with keyboard access. Colored areas, markers and legends use the same category colors.

Diagram messaging supports opaque sandbox previews without `allow-same-origin`: only registered diagram windows with matching source URLs exchange theme and height messages.
Diagram canvases share the `color.figure.canvas` role in SVG and HTML. Card and tab option lists are exported for consumer validation.

`ProjectList({ title, projects })` groups each project card with its related links. Supply content, validated URLs and optional trusted icon slots; see the [component contract](docs/components.md#프로젝트-목록).

`BlogCard.commentsHref` creates a separate comments link outside the article link.

Diagram flashes and active card surfaces use `color.figure.flash` and `color.figure.active-surface`, independently of search and help hover roles.

Dark cards share the page surface and readable title and description roles; hover and active states preserve text contrast.

Chart growth shapes and HTML playback styles are shared by the design source; ThinkFlow owns scene timing for SVG output.

Project videos stay collapsed before JavaScript initializes. Without JavaScript, the explicit video link opens native controls through its fragment target.

Search results may omit the `icon` slot. `SearchMessage({ lines })` centers escaped message lines in a paragraph; a consumer may append its retry button to the wrapper. Canvas and footer text follow the dark semantic theme.

Landing headings, descriptions and section surfaces follow the dark semantic theme. Disabled newsletter controls retain readable text while using neutral colors and native disabled behavior.

In dark mode, the canvas behind newsletter and footer sections uses the existing deeper surface to preserve their distinction from the main content.

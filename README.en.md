<h1 align="center">design-tokens</h1>

<p align="center">
  Shared design tokens, CSS, icons, and HTML components for static sites and diagram tools<br>
  <a href="README.md">한국어</a> | English
</p>

This repository defines token values, shared styles, and browser behavior. Consumer apps provide content and routes, then include the HTML and CSS from this package in their pages.

> [!NOTE]
> In development. There are no public releases; install the committed artifacts as a Git dependency.

## Contents

- [Quick start](#quick-start)
- [Why](#why)
- [How it works](#how-it-works)
- [Status](#status)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## Quick start

Node.js 20 or later and npm are required. From the repository root, install the dependencies and print a card group as HTML.

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

The output contains an `app-support-grid is-four` group and a link to `/docs/memory/`. This example produces static HTML without React or browser initialization. To display it, include the package's `styles.css` and `tokens.css` with the generated HTML.

Other apps install a verified commit as a pinned Git dependency. The repository includes `dist/`, so installation does not rebuild the design files. [Shared design distribution](docs/distribution.md) covers installation, CSS paths, and updates.

The CSS compiler bundles PurgeCSS and its selector parser at build time. Consumer installations require `esbuild` and `postcss`, with no additional overrides. The repository's root override applies to build inputs. The package test checks CSS output, the dependency tree, and audit results in an installation without overrides. Separate checks cover bundled inputs and licenses.

## Why

Separate implementations of site cards, documents, and diagram controls require the same color, spacing, or tab behavior to change in several places. This repository provides tokens, HTML components, and shared browser behavior together. Consumers inherit the defaults and express product differences through component properties and semantic tokens.

Consumers own content, URLs, search indexes, and service policies. An independent product that does not share this design is better served by its own component system.

## How it works

1. `tokens/` defines shared values and dark-mode differences. `styles/` defines shared CSS.
2. Components in `ui/` validate plain text and URLs, then produce static HTML. HTML slots accept component output or verified markup.
3. `npm run build` exports tokens, CSS, icons, and UI modules to `dist/`. `dist/manifest.json` records SHA-256 hashes for the files.
4. Consumers read components and assets from the pinned package. `compileStyles` retains the CSS in use, and `runtimeEntrypoints` selects the behavior required by each page.

`trusted()` does not sanitize HTML. Use it only for markup from a safe renderer. [Shared components](docs/components.md) describes the inputs, and [architecture](docs/architecture.md) describes module ownership.

## Status

| Area | Current state |
|---|---|
| Available | Light and dark tokens, CSS, an icon catalog, static HTML components, and optional browser behavior |
| Distribution | Apps install a pinned Git commit. A merge here, a consumer update, and deployment are separate steps |
| Outside this package | App content, routes, search indexes, comment providers, and Torso geometry and scene timing |
| Remaining verification | [Light search field comparison and screenshots #11](https://github.com/woonyong-choi/design-tokens/issues/11) |
| Verification scope | Automated checks cover inputs, token references, contrast, and generated artifacts. Consumer visual review and user testing are separate |

The package version is `0.1.1`. Inputs and components may change before 1.0, so run consumer checks and visual review when updating a pinned commit. No GitHub release or public npm package was found on 2026-10-17.

Project code uses MIT. Fonts and external assets retain their own licenses and notices. [Asset sources](assets/sources.json) records provenance for each file. [Shared icons](docs/design/content-icons.md) describes icon sources and consumption.

## Documentation

The design documents are written in Korean.

- [아키텍처](docs/architecture.md): 코드 구조, 생성 흐름과 소유 경계
- [Full document index](docs/README.md)

## Development

Regenerate the committed artifacts whenever their sources change.

```sh
npm run build
npm test
npm run check
```

`npm run check` compares the current artifacts with a fresh build. CI runs `npm ci`, `npm test`, and `npm run check` on Node.js 20 and 22. See [style structure](docs/styles.md#확인) for browser checks and [contributing](.github/CONTRIBUTING.md) for the change workflow.

Audit hard-coded presentation values and undefined CSS variables from the repository root.

```sh
node ui/build/check-tokens.mjs styles ui --tokens tokens/tokens.json
```

Violations return exit code 1. Missing inputs or unreadable token sources return exit code 2. Only an actual comment with a reason after `tokens-allow:` exempts its own line. [Audit coverage](docs/styles.md#강제하는-것) lists accepted values and runtime inputs.

The [document index](llms.txt) follows the README introduction and documentation list. Keep it in sync when changing titles, the introduction, or document links.

## License

[MIT](LICENSE)

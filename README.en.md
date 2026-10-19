<h1 align="center">design-tokens</h1>

<p align="center">
  Shared design tokens, CSS, icons, and HTML components for static sites and diagram tools<br>
  <a href="https://github.com/woonyong-choi/design-tokens/actions/workflows/ci.yml"><img src="https://github.com/woonyong-choi/design-tokens/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a><br>
  <a href="README.md">한국어</a> | English
</p>

The package provides design values such as colors, spacing, and typography alongside HTML components such as cards and tabs. Tokens, CSS, icons, and browser behavior live in one place so static sites and diagram tools can share a design.

> [!NOTE]
> In development. There are no releases; build from source.

## Quick start

Node.js 20 or later and npm are required. Diagram consumers can use the [diagram tarball installation](docs/distribution.md#도표-전용-tarball).

### Run from the repository

Download the repository, then install the dependencies and build the distribution files from its root.

```sh
npm ci
npm run build
```

Print a card group as HTML.

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

The output is an `app-support-grid is-four` group containing a link to `/docs/memory/`. To display it in a browser, include the HTML with the package's `tokens.css` and `styles.css`. Preserve the relative paths to fonts and icons referenced by the CSS. Follow the complete [card preview example](docs/distribution.md#카드-미리보기) to open the styled card in a browser.

### Install in another project

This command installs a verified commit as a Git dependency.

```sh
npm install --save-dev 'github:woonyong-choi/design-tokens#1441d59721cea72a69a1e72b0ca3a3572b309ac3'
```

Run the same HTML example in the consuming project. The commit includes generated `dist/` files, so consumers do not need to rebuild the design files. Follow the [update procedure](docs/distribution.md#갱신) when moving to a new commit.

## Why

Building site cards and diagram controls separately means changing the same colors, spacing, and tab behavior in several places. This package shares design values, HTML structure, and common behavior together. Each app owns its content, URLs, search indexes, and service policies.

An independent product that does not share this design is better served by its own component system.

## How it works

1. Define shared design values and components in `tokens/`, `styles/`, `assets/`, and `ui/`.
2. `npm run build` generates tokens, CSS, icons, and HTML modules in `dist/`.
3. The consuming app pins a Git commit that includes these artifacts.
4. The app reads HTML and assets from the package and connects them to its pages. Its build can select the CSS and browser behavior it needs.

![Each app installs a pinned commit of the package built from the shared design sources](docs/assets/build-flow.svg)

[Architecture](docs/architecture.md) describes ownership from input to consumption and how to regenerate the figure. HTML slots accept verified markup. `trusted()` does not sanitize HTML; see [shared components](docs/components.md) for input requirements.

## Status

| Area | Current state |
|---|---|
| Available | Light and dark tokens, CSS, icons, static HTML components, and optional browser behavior |
| Distribution | A pinned Git dependency containing generated artifacts |
| Not available | GitHub releases and a public npm distribution |
| Remaining check | [Light search field comparison and screenshots #11](https://github.com/woonyong-choi/design-tokens/issues/11) |

The package version is `0.1.1`. Inputs and components may change before 1.0. Run consumer checks and visual review when updating a commit. A merge in this repository does not update or deploy consumers.

## Documentation

The design documents are written in Korean.

- [Architecture](docs/architecture.md)
  - [Shared design distribution](docs/distribution.md)
  - [Style structure](docs/styles.md)
- [Shared components](docs/components.md)
  - [Shared icons](docs/design/content-icons.md)

[All documentation](docs/README.md)

## Development

Update generated artifacts when changing their sources.

```sh
npm run build
npm test
npm run check
```

CI runs installation, tests, and artifact checks on Node.js 20 and 22. `npm run check` compares committed artifacts with a fresh build. See the [contribution guide](.github/CONTRIBUTING.md) for the change process and [style structure](docs/styles.md#강제하는-것) for checks on visual values and CSS variables.

Fonts and third-party assets follow the terms in [sources and licenses](assets/sources.json).

## License

[MIT](LICENSE)

# Contributing

This guide explains how to contribute to design-tokens.

## Before you start

Open an issue before you start work.

## Development environment

Requirements: Node.js 20 or later. Install the locked build dependencies with `npm ci`.

```sh
git clone https://github.com/woonyong-choi/design-tokens.git
cd design-tokens
```

## Checks

All of the following commands must pass before a pull request. Regenerating must leave no diff.

```sh
node scripts/build.mjs
npm test
```

## Commits and pull requests

| Item | Format | Example |
|---|---|---|
| Branch | `{type}/{issue number}-{description}` | `feat/1-token-source` |
| Commit | `{type}({scope}): {description in Korean}` | `feat(tokens): 의미 토큰 추가` |
| Pull request | One pull request per issue, with `Closes: #{number}` in the body | Not applicable |

## Documentation

When you change a rule, a token name or a package export, update the [design documents](../docs/README.md) and both README files in the same pull request. The design documents are written in Korean.

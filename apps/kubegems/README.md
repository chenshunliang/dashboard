<p align="center">
  <a href="https://kubegems.io" target="_blank">
    <img alt="Kubegems Logo" width="30%" style="max-width: 100%;" src="./public/kubegems-logo.jpeg">
  </a>
</p>

<p align="center">
  <a href="https://github.com/kubegems/dashboard/actions">
    <img src="https://github.com/kubegems/dashboard/workflows/build/badge.svg" alt="CI badge">
  </a>
  <a href="https://cn.vuejs.org/">
    <img src="https://img.shields.io/badge/Language-Vue-blue.svg" alt="Language">
  </a>
  <a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/vue-2.7.x-green.svg" alt="vue">
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License">
  </a>
  <a title="Crowdin" target="_blank" href="https://crowdin.com">
    <img src="https://badges.crowdin.net/kubegems-dashboard/localized.svg">
  </a>
  <a title="commitizen" target="_blank" href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg">
  </a>
  <a title="release" target="_blank" href="https://github.com/kubegems/dashboard/releases">
    <img src="https://img.shields.io/github/v/release/kubegems/dashboard?include_prereleases">
  </a>
  <a title="size" target="_blank" href="/">
    <img src="https://img.shields.io/github/repo-size/kubegems/dashboard">
  </a>
  <a title="github search hit" target="_blank" href="https://github.com/kubegems">
    <img src="https://img.shields.io/github/search/kubegems/dashboard/kubegems">
  </a>
  <a title="commit-activity" target="_blank" href="https://github.com/kubegems">
    <img alt="preview badge" src="https://img.shields.io/github/commit-activity/m/kubegems/dashboard">
  </a>
</p>

<p align="center">
  <img alt="Kubegems Dashboard" width="85%" style="max-width: 100%;" src="./public/dashboard.png">
</p>

## Introduction

KubeGems is an open source enterprise-grade multi-tenant container cloud platform. Around the cloud native community. KubeGems provides the ability to access multiple Kubernetes clusters, and has rich component management and resource cost analysis functions. It can help enterprises to quickly build and build a localized, powerful and low-cost cloud management platform.

KubeGems Dashboard is the web interface for [KubeGems](https://github.com/kubegems/kubegems).

## How to build

### Requirement

#### Node.js

Node.js is required. If you don't have a Node.js development environment, please [set it up](https://nodejs.org/en/download/). The minimum version required is 16.

#### Pnpm

We use [Pnpm](https://pnpm.io/) to do package management. If you don't have pnpm, use the following to install:

```sh
npm install -g pnpm
```

Clone the repository, and run `pnpm && pnpm build`

```sh
git clone https://github.com/kubegems/dashboard.git
cd dashboard/
pnpm && pnpm build
pnpm start
```

## Documentation

To check out [live demo](https://demo.kubegems.io/) and docs, visit [kubegems.io](https://kubegems.io).

## Issues

Please make sure to read the [Issue Template](https://github.com/kubegems/dashboard/blob/main/.github/ISSUE_TEMPLATE.md) and [Pull Request Template](https://github.com/kubegems/dashboard/blob/main/.github/PULL_REQUEST_TEMPLATE.md) before opening an issue or create PR.

## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/kubegems/dashboard/releases).

### 📑 License

[Apache-2.0](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2021-present Kubegems.io

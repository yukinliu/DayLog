# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Tauri + Vite + React + TypeScript. GitHub and Gitee are used for source hosting and dmg release distribution only, not as runtime backends.

## Users

Primary users are individuals who want a quiet local tool for daily time logging, project continuity, mood/thought awareness, and later review. The first target platform is macOS.

## Product Purpose

刘迷糊 DayLog · 见己 is a local-first time journal. It lets users record feeling experiences and factual experiences, manage projects, review statistics, and automatically generate readable Markdown files by date.

## Positioning

DayLog Desktop is not an account system or cloud dashboard. Its distinct mechanism is dual storage: JSON as the app's reliable data source, and daily Markdown as a user-readable, portable local record.

## Operating Context

The app runs locally after installation from a dmg. Users choose or create a local DayLog vault. Records may be entered today while belonging to past or future dates.

## Capabilities and Constraints

- No login, backend, CloudBase, cloud sync, or Pro gating in the desktop MVP.
- Main navigation: record, project, stats, calendar; product navigation: recommend, settings.
- Record page writes new entries only and shows today's input summary.
- Project page manages projects and project progress labels.
- Stats page reviews selected single-day or interval data.
- Calendar page is a read-only monthly overview.
- Markdown is generated automatically from JSON and is not the only source of truth.

## Brand Commitments

Product name: 刘迷糊 DayLog · 见己. The product should feel local, quiet, durable, warm, and not like a commercial admin panel.

## Evidence on Hand

- `docs/DayLog 桌面端产品设计文档.md`
- `docs/DayLog Desktop 视觉系统文档.md`
- `docs/DayLog Desktop 开发计划.md`

## Product Principles

- Local data belongs to the user.
- Record and review are separate workflows.
- Facts and awareness have equal dignity.
- Project management supports continuity without becoming heavy.
- Desktop layout should reduce page clutter, not reproduce the web home page.

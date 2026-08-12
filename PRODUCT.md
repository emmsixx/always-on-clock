# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who keep a computer in fullscreen or focus-heavy work — video, games, writing, streaming, remote calls — and lose track of the system clock because the taskbar or menu bar is hidden. They want the time visible without leaving what they are doing, and without a widget that steals clicks.

## Product Purpose

Always On Clock puts a configurable time readout on top of every other window. Success is the clock being permanently glanceable and completely ignorable: readable over whatever is behind it, never intercepting a click, never needing to be managed once configured.

## Positioning

A clock that becomes part of the desktop rather than an app on it. Pinned, the window is always-on-top *and* click-through, so it floats over fullscreen content without stealing input — a combination most desktop clock widgets do not offer. It is a single-purpose Tauri binary, not a widget host or dashboard.

## Operating Context

- Two windows: `main` (undecorated, transparent, no shadow, 300×500 default, position and size persisted) and `settings` (undecorated, opened beside the main window).
- Pinned state turns on always-on-top, disables resizing, ignores cursor events, and reveals a system-tray menu (Show Window / Settings / Unpin / Quit). Unpinned, the window shows its own chrome for dragging, pinning, and opening settings.
- A global shortcut (default `Ctrl/⌘+Shift+C`) toggles visibility from anywhere.
- Settings persist through `@tauri-apps/plugin-store` (`settings.json`) and sync live between the two windows via a `settings-updated` event plus store change listeners. There is no save button; every change is written immediately.
- The clock is judged against arbitrary desktop backgrounds — bright wallpapers and dark fullscreen video alike — so text color, text opacity, and background opacity are legibility controls, not decoration.

## Capabilities and Constraints

Confirmed settings surface: time format (12h/24h), seconds toggle, date display (hidden/short/long/full), font size (small/medium/large/xlarge), theme preset (Dark/Light/Neon/Minimal/Custom), custom text and background colors, background opacity, text opacity, global shortcut, launch on startup. Window position and size are persisted state, not user-facing settings.

Constraints:
- React 19 + TypeScript + Vite + Tailwind v4; Tauri 2 with the store, autostart, global-shortcut, positioner, and opener plugins. Icons come from `lucide-react`.
- Each Tauri window has its own capability allowlist; the `settings` window only gets what `src-tauri/capabilities/settings.json` grants.
- The main window is transparent with `shadow: false`, so anything drawn there composites directly over the user's desktop.
- Persisted setting keys are a stored contract (`settings.<name>`, plus a legacy `settings` blob); renaming or removing one breaks existing installs.

## Brand Commitments

- Product name: **Always On Clock**. Identifier `com.emmsixx.always-on-clock`, GPL-3.0, repository `github.com/emmsixx/always-on-clock`.
- Craft bar set by the user (2026-08-12): Raycast, Linear, and Arc. Modern cross-platform product UI that looks deliberate on any OS rather than imitating one host platform's settings app. Recorded as a standing preference for future surfaces.

## Evidence on Hand

Working application code and README only. No user research, testimonials, install counts, press, or benchmarks exist — future work must not invent them. Version is `1.0.0` in `package.json` and `src-tauri/tauri.conf.json`.

## Product Principles

1. **The overlay is the product; the app is the setting.** Configuration exists to make the clock readable and unobtrusive, and should show its effect on the clock rather than describe it.
2. **Legibility is the real variable.** Every appearance control ultimately answers "can I read this over what is behind it?" — so it must be judged against light and dark backgrounds, not in the abstract.
3. **No management overhead.** Settings apply and persist instantly; there is nothing to save, confirm, or reconcile.
4. **Never steal input.** Pinned, the clock must remain click-through and out of the way, whatever else changes.
5. **One binary, one job.** Resist feature surface that turns a clock into a widget platform.

## Accessibility & Inclusion

No product-specific standard was established. The interface is keyboard-operable and contrast-checked as a baseline; the clock's own contrast is under user control by design.

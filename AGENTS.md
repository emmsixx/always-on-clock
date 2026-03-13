# AGENTS.md

## Cursor Cloud specific instructions

This is a **Tauri 2** desktop application (Rust backend + React 19/TypeScript frontend). A single command `pnpm tauri dev` starts both the Vite dev server (port 1420) and the native Tauri window.

### Prerequisites (system-level, installed once in the VM snapshot)

- **Tauri Linux system libraries**: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
- **Rust stable** (1.94+): The default rustup toolchain must be `stable`, not the older system-pinned `1.83.0`. Run `rustup default stable` if `cargo --version` shows < 1.94.
- **Node.js** (v18+) and **pnpm** (v9+): Already available via nvm.

### Key commands

| Task | Command |
|---|---|
| Install frontend deps | `pnpm install` |
| TypeScript lint/check | `pnpm exec tsc --noEmit` |
| Frontend build | `pnpm build` |
| Rust check | `cd src-tauri && cargo check` |
| Run dev (full app) | `pnpm tauri dev` |
| Production build | `pnpm tauri build` |

### Gotchas

- The first `cargo check` / `pnpm tauri dev` after a clean clone takes ~60s to compile all Rust dependencies. Subsequent builds are incremental and much faster.
- In headless/VM environments, expect `libEGL warning: DRI3 error` messages — these are benign and the app still renders correctly via software rendering.
- `pnpm tauri dev` auto-runs `pnpm dev` (Vite) as a `beforeDevCommand`; you don't need to start Vite separately.
- There are no automated test suites in this repository. Validation is done via TypeScript type checking (`tsc --noEmit`) and building the app.

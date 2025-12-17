# Always On Clock

A lightweight, customizable desktop clock overlay built with Tauri, React, and TypeScript. The clock stays always-on-top and can be pinned as a transparent overlay that's click-through, perfect for keeping track of time while working.

> This started as a quick prototype I made a while back. Finally got around to finishing it up and adding all the features I originally wanted. It's not perfect, but figured I'd open source it in case anyone else finds it useful.

## Features

- **Always-on-Top Mode** - Pin the clock to stay above other windows
- **Transparent Overlay** - Click-through when pinned, allowing interaction with windows behind
- **Time Format Options** - Switch between 12-hour and 24-hour formats
- **Seconds Display** - Toggle seconds visibility
- **Date Display** - Optional date with multiple format options
- **Customizable Appearance**
  - Multiple theme presets (Dark, Light, Neon, Minimal)
  - Custom text and background colors
  - Adjustable font size
  - Opacity controls for text and background
- **Window Position Memory** - Remembers position and size between sessions
- **System Tray Integration** - Access controls from the system tray when pinned
- **Global Keyboard Shortcut** - Toggle visibility with a hotkey (default: `Ctrl+Shift+C`)
- **Launch on Startup** - Option to start automatically with your system

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) package manager
- [Rust](https://rustup.rs/) (latest stable)

### Build from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/emmsixx/always-on-clock.git
   cd always-on-clock
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run in development mode:
   ```bash
   pnpm tauri dev
   ```

4. Build for production:
   ```bash
   pnpm tauri build
   ```

## Usage

- **Pin/Unpin** - Click the pin icon in the title bar to toggle always-on-top mode
- **Settings** - Click the gear icon to open the settings panel
- **Drag** - Click and drag the title bar to move the window (when unpinned)
- **Resize** - Drag window edges to resize (when unpinned)
- **System Tray** - When pinned, right-click the tray icon for quick actions

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Tauri 2, Rust
- **Icons**: Lucide React

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

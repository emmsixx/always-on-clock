import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AlertTriangle, Check, Clock3, Info, Palette, Sliders, X, Zap } from "lucide-react";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import ClockPreview from "./components/ClockPreview";
import ClockPane from "./components/panes/ClockPane";
import AppearancePane from "./components/panes/AppearancePane";
import BehaviorPane from "./components/panes/BehaviorPane";
import AboutPane from "./components/panes/AboutPane";
import "./globals.css";

const SECTIONS = [
  { id: "clock", label: "Clock", icon: Clock3, blurb: "How the time itself reads." },
  { id: "appearance", label: "Appearance", icon: Palette, blurb: "Size, color, and how much of the desktop shows through." },
  { id: "behavior", label: "Behavior", icon: Zap, blurb: "How the clock starts, hides, and comes back." },
  { id: "about", label: "About", icon: Info, blurb: "Version, links, and a way back to defaults." },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SettingsWindowContent: React.FC = () => {
  const { settings, isLoading, lastSavedAt, saveError } = useSettings();
  const [section, setSection] = useState<SectionId>("clock");
  const [justSaved, setJustSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(async () => {
    try {
      await getCurrentWindow().close();
    } catch (error) {
      console.error("Failed to close settings window:", error);
    }
  }, []);

  // Esc closes the window, matching every other settings panel on the desktop — unless a
  // control is mid-interaction and wants Esc for itself (the shortcut recorder).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      void handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  // A quiet acknowledgement that there is nothing to save, shown only when something changed.
  useEffect(() => {
    if (!lastSavedAt) return undefined;
    setJustSaved(true);
    const timeout = window.setTimeout(() => setJustSaved(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [lastSavedAt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [section]);

  const activeIndex = SECTIONS.findIndex((item) => item.id === section);
  const active = SECTIONS[activeIndex];

  const handleNavKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (activeIndex + delta + SECTIONS.length) % SECTIONS.length;
    setSection(SECTIONS[next].id);
    document.getElementById(`nav-${SECTIONS[next].id}`)?.focus();
  };

  return (
    <div className="settings-shell">
      <header className="settings-titlebar" data-tauri-drag-region>
        <div className="settings-identity" data-tauri-drag-region>
          <span className="settings-mark" aria-hidden="true">
            <Sliders size={13} strokeWidth={2.4} />
          </span>
          <h1 className="settings-titlebar-title" data-tauri-drag-region>
            Always On Clock
          </h1>
          <span className="settings-titlebar-sep" aria-hidden="true" />
          <span className="settings-titlebar-context">Settings</span>
        </div>
        <button
          type="button"
          onClick={() => void handleClose()}
          className="icon-button icon-button--close"
          aria-label="Close settings"
          title="Close settings (Esc)"
        >
          <X size={15} strokeWidth={2.2} />
        </button>
      </header>

      <div className="settings-body">
        <nav
          className="settings-rail"
          aria-label="Settings sections"
          onKeyDown={handleNavKeyDown}
        >
          <div
            className="settings-nav"
            role="tablist"
            aria-orientation="vertical"
            style={{ "--nav-index": activeIndex } as React.CSSProperties}
          >
            <span className="settings-nav-indicator" aria-hidden="true" />
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === section;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={isActive ? `pane-${item.id}` : undefined}
                  tabIndex={isActive ? 0 : -1}
                  className={`settings-nav-item ${isActive ? "is-active" : ""}`.trim()}
                  onClick={() => setSection(item.id)}
                >
                  <Icon size={15} strokeWidth={2.1} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <p
            className={`settings-status ${saveError ? "is-error" : justSaved ? "is-saved" : ""}`.trim()}
          >
            <span className="settings-status-icon" aria-hidden="true">
              {saveError ? (
                <AlertTriangle size={10} strokeWidth={2.8} />
              ) : (
                <Check size={11} strokeWidth={3} />
              )}
            </span>
            <span aria-live="polite">
              {saveError ? saveError : justSaved ? "Saved" : "Changes save instantly"}
            </span>
          </p>
        </nav>

        <main className="settings-main">
          {isLoading ? (
            <div className="settings-loading" role="status">
              <span className="settings-loading-bar" aria-hidden="true" />
              Loading your settings…
            </div>
          ) : (
            <>
              <ClockPreview settings={settings} />
              <div className="settings-scroll" ref={scrollRef}>
                <div
                  className="settings-pane"
                  id={`pane-${section}`}
                  role="tabpanel"
                  aria-labelledby={`nav-${section}`}
                  key={section}
                  tabIndex={-1}
                >
                  <div className="pane-heading">
                    <h2>{active.label}</h2>
                    <p>{active.blurb}</p>
                  </div>
                  {section === "clock" && <ClockPane />}
                  {section === "appearance" && <AppearancePane />}
                  {section === "behavior" && <BehaviorPane />}
                  {section === "about" && <AboutPane />}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const SettingsWindow: React.FC = () => (
  <SettingsProvider>
    <SettingsWindowContent />
  </SettingsProvider>
);

export default SettingsWindow;

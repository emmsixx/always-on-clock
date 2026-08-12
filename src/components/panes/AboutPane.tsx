import React, { useState } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useSettings } from '../../contexts/SettingsContext';

const REPOSITORY = 'https://github.com/emmsixx/always-on-clock';

const LINKS = [
  { label: 'Repository', detail: 'Source, issues, and releases', href: REPOSITORY },
  { label: 'License', detail: 'GPL-3.0', href: `${REPOSITORY}/blob/main/LICENSE` },
] as const;

const AboutPane: React.FC = () => {
  const { resetSettings } = useSettings();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const open = async (href: string) => {
    try {
      setLinkError(null);
      await openUrl(href);
    } catch (error) {
      console.error('Failed to open link:', error);
      setLinkError(href);
    }
  };

  return (
    <div className="field-group">
      <div className="about-summary">
        <p>
          A clock that sits above everything else and gets out of the way. Version{' '}
          <span className="tabular">{__APP_VERSION__}</span>.
        </p>
      </div>

      <ul className="link-list">
        {LINKS.map((link) => (
          <li key={link.href}>
            <button type="button" className="link-row" onClick={() => void open(link.href)}>
              <span className="link-row-copy">
                <span className="link-row-label">{link.label}</span>
                <span className="link-row-detail">{link.detail}</span>
              </span>
              <ArrowUpRight size={15} strokeWidth={2.1} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {linkError && (
        <p className="inline-error" role="alert">
          Could not open your browser. The address is{' '}
          <span className="tabular">{linkError}</span>
        </p>
      )}

      <div className="danger-row">
        <div className="field-copy">
          <span className="field-label">Restore defaults</span>
          <span className="field-hint">
            Resets every setting on this window. Your clock keeps its position and size.
          </span>
        </div>
        {confirmingReset ? (
          <div className="confirm">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setConfirmingReset(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => {
                void resetSettings().catch(() => undefined);
                setConfirmingReset(false);
              }}
            >
              Reset everything
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setConfirmingReset(true)}
          >
            <RotateCcw size={13} strokeWidth={2.3} aria-hidden="true" />
            Restore
          </button>
        )}
      </div>
    </div>
  );
};

export default AboutPane;

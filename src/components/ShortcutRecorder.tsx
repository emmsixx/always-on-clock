import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, RotateCcw, X } from 'lucide-react';

interface ShortcutRecorderProps {
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
}

const MODIFIER_ORDER = ['CommandOrControl', 'Alt', 'Shift'];
const MODIFIER_CODES = new Map<string, string>([
  ['ControlLeft', 'CommandOrControl'],
  ['ControlRight', 'CommandOrControl'],
  ['MetaLeft', 'CommandOrControl'],
  ['MetaRight', 'CommandOrControl'],
  ['AltLeft', 'Alt'],
  ['AltRight', 'Alt'],
  ['ShiftLeft', 'Shift'],
  ['ShiftRight', 'Shift'],
  ['Control', 'CommandOrControl'],
  ['Meta', 'CommandOrControl'],
  ['Alt', 'Alt'],
  ['Shift', 'Shift'],
]);

const SPECIAL_KEY_LABELS: Record<string, string> = {
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  Backquote: '`',
  Backslash: '\\',
  Backspace: 'Backspace',
  BracketLeft: '[',
  BracketRight: ']',
  CapsLock: 'CapsLock',
  Comma: ',',
  Delete: 'Delete',
  End: 'End',
  Enter: 'Enter',
  Equal: '=',
  Escape: 'Escape',
  Home: 'Home',
  Insert: 'Insert',
  Minus: '-',
  PageDown: 'PageDown',
  PageUp: 'PageUp',
  Period: '.',
  Quote: "'",
  Semicolon: ';',
  Slash: '/',
  Space: 'Space',
  Tab: 'Tab',
};

function modifierForCode(code: string): string | null {
  return MODIFIER_CODES.get(code) ?? null;
}

function keyTokenForCode(code: string): string | null {
  const modifier = modifierForCode(code);
  if (modifier) return modifier;
  if (!code || code === 'Unidentified') return null;
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^F(?:[1-9]|1[0-2])$/.test(code)) return code;
  if (SPECIAL_KEY_LABELS[code]) return code;
  if (/^Numpad/.test(code)) return code;
  return null;
}

function buildShortcutParts(codes: Iterable<string>): string[] {
  const tokens = Array.from(codes)
    .map(keyTokenForCode)
    .filter((token): token is string => token !== null);
  const modifiers = MODIFIER_ORDER.filter((modifier) => tokens.includes(modifier));
  const primaryKeys = tokens.filter((token) => !MODIFIER_ORDER.includes(token));
  const primaryKey = primaryKeys[primaryKeys.length - 1];

  return primaryKey ? [...modifiers, primaryKey] : modifiers;
}

function normalizeShortcutToken(token: string): string {
  return token === 'CmdOrControl' || token === 'CtrlOrCommand' ? 'CommandOrControl' : token;
}

function shortcutTokens(value: string): string[] {
  return value
    .split('+')
    .map((token) => normalizeShortcutToken(token.trim()))
    .filter(Boolean);
}

function displayKey(token: string): string {
  if (token === 'CommandOrControl') return 'Ctrl / ⌘';
  if (token === 'ArrowDown') return '↓';
  if (token === 'ArrowLeft') return '←';
  if (token === 'ArrowRight') return '→';
  if (token === 'ArrowUp') return '↑';
  if (token.startsWith('Numpad')) return token.replace('Numpad', 'Num ');
  return SPECIAL_KEY_LABELS[token] ?? token;
}

function hasModifier(tokens: string[]): boolean {
  return tokens.some((token) => MODIFIER_ORDER.includes(token));
}

const ShortcutRecorder: React.FC<ShortcutRecorderProps> = ({ value, defaultValue, onChange }) => {
  const controlRef = useRef<HTMLButtonElement>(null);
  const onChangeRef = useRef(onChange);
  const pressedCodesRef = useRef(new Set<string>());
  const [isRecording, setIsRecording] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Click to record a new shortcut.');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!isRecording) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      const code = event.code || event.key;

      if (event.repeat) return;

      if (event.key === 'Escape' || code === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        pressedCodesRef.current.clear();
        setPressedKeys([]);
        setIsRecording(false);
        setFeedback('Recording cancelled.');
        return;
      }

      if (!keyTokenForCode(code)) return;

      event.preventDefault();
      event.stopPropagation();
      pressedCodesRef.current.add(code);

      const parts = buildShortcutParts(pressedCodesRef.current);
      setPressedKeys(parts);

      const pressedToken = keyTokenForCode(code);
      const pressedPrimaryKey = pressedToken !== null && !MODIFIER_ORDER.includes(pressedToken);

      if (pressedPrimaryKey && parts.length > 1 && hasModifier(parts)) {
        onChangeRef.current(parts.join('+'));
        pressedCodesRef.current.clear();
        setPressedKeys([]);
        setIsRecording(false);
        setFeedback('Shortcut saved. Click to record again.');
      } else if (parts.some((part) => !MODIFIER_ORDER.includes(part))) {
        setFeedback('Add Ctrl / ⌘, Alt, or Shift before the key.');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const code = event.code || event.key;
      pressedCodesRef.current.delete(code);
      setPressedKeys(buildShortcutParts(pressedCodesRef.current));
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isRecording]);

  const startRecording = () => {
    pressedCodesRef.current.clear();
    setPressedKeys([]);
    setFeedback('Press Ctrl / ⌘, Alt, or Shift plus another key.');
    setIsRecording(true);
    controlRef.current?.focus();
  };

  const cancelRecording = () => {
    pressedCodesRef.current.clear();
    setPressedKeys([]);
    setIsRecording(false);
    setFeedback('Recording cancelled.');
    controlRef.current?.focus();
  };

  const tokens = isRecording ? pressedKeys : shortcutTokens(value);
  const isDefault = value === defaultValue;

  return (
    <div className={`shortcut-recorder ${isRecording ? 'is-recording' : ''}`}>
      <div className="shortcut-recorder-row">
        <button
          ref={controlRef}
          id="global-shortcut"
          type="button"
          className="shortcut-recorder-control"
          onClick={startRecording}
          aria-labelledby="global-shortcut-label"
          aria-describedby="global-shortcut-help global-shortcut-status"
          aria-pressed={isRecording}
        >
          <Keyboard size={16} strokeWidth={2} className="shortcut-recorder-icon" aria-hidden="true" />
          <span className="shortcut-recorder-keys">
            {tokens.length > 0 ? (
              tokens.map((token) => <kbd key={token}>{displayKey(token)}</kbd>)
            ) : (
              <span className="shortcut-recorder-placeholder">
                {isRecording ? 'Press a shortcut…' : 'Not set'}
              </span>
            )}
          </span>
          <span className={`shortcut-recorder-action ${isRecording ? 'is-live' : ''}`}>
            {isRecording ? 'Listening' : 'Click to change'}
          </span>
        </button>
        {isRecording && (
          <button
            type="button"
            className="shortcut-recorder-cancel"
            onClick={cancelRecording}
            aria-label="Cancel shortcut recording"
            title="Cancel recording"
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="shortcut-recorder-footer">
        <span id="global-shortcut-status" className="shortcut-recorder-status" role="status" aria-live="polite">
          {feedback}
        </span>
        {!isDefault && !isRecording && (
          <button
            type="button"
            className="shortcut-recorder-reset"
            onClick={() => onChange(defaultValue)}
          >
            <RotateCcw size={12} strokeWidth={2.3} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default ShortcutRecorder;

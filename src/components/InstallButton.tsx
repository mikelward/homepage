import { useEffect, useState } from 'react';
import './InstallButton.css';

// Not yet in lib.dom — Chromium-only event that lets us defer the
// native install prompt until the user clicks our button.
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

export function InstallButton() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!event) return null;

  const install = async () => {
    await event.prompt();
    await event.userChoice;
    // Hide either way: on accept the appinstalled event will fire too,
    // on dismiss the browser won't re-fire beforeinstallprompt until
    // its own heuristics decide we're worth offering again.
    setEvent(null);
  };

  return (
    <button
      type="button"
      className="install"
      onClick={() => void install()}
    >
      Install
    </button>
  );
}

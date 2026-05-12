import { useEffect, useId, useRef, useState } from 'react';
import { safeHostname } from '../lib/favicon';
import type { LinkEntry } from '../lib/links';
import './EditLinkDialog.css';

export type EditTarget =
  | { kind: 'add' }
  | { kind: 'edit'; link: LinkEntry };

type Props = {
  target: EditTarget | null;
  onClose: () => void;
  onSave: (values: { name: string; url: string }) => void;
  onDelete?: () => void;
};

export function EditLinkDialog({ target, onClose, onSave, onDelete }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const nameId = useId();
  const urlId = useId();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Re-seed the form whenever the dialog opens for a different target.
  useEffect(() => {
    if (!target) return;
    if (target.kind === 'edit') {
      setName(target.link.name);
      setUrl(target.link.url);
    } else {
      setName('');
      setUrl('');
    }
    setError(null);
  }, [target]);

  // Open/close the native <dialog> when the target changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target && !el.open) el.showModal();
    if (!target && el.open) el.close();
  }, [target]);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('URL is required.');
      return;
    }
    const host = safeHostname(trimmedUrl);
    if (!host) {
      setError('Enter a full URL, including https://');
      return;
    }
    const finalName = name.trim() || host;
    onSave({ name: finalName, url: trimmedUrl });
  };

  return (
    <dialog
      ref={ref}
      className="edit-dialog"
      onClose={onClose}
      onCancel={onClose}
    >
      <form
        className="edit-dialog__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <h2 className="edit-dialog__title">
          {target.kind === 'add' ? 'Add link' : 'Edit link'}
        </h2>

        <label htmlFor={urlId} className="edit-dialog__label">
          URL
        </label>
        <input
          id={urlId}
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor={nameId} className="edit-dialog__label">
          Name <span className="edit-dialog__hint">(optional)</span>
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="off"
          placeholder="Defaults to the site's hostname"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && (
          <p role="alert" className="edit-dialog__error">
            {error}
          </p>
        )}

        <div className="edit-dialog__actions">
          {target.kind === 'edit' && onDelete && (
            <button
              type="button"
              className="edit-dialog__danger"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
          <span className="edit-dialog__spacer" />
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="edit-dialog__primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

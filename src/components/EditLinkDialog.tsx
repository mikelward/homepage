import { useEffect, useId, useRef } from 'react';
import type { LinkEntry } from '../lib/links';
import './EditLinkDialog.css';

export type EditTarget =
  | { kind: 'add' }
  | { kind: 'edit'; link: LinkEntry };

type Props = {
  target: EditTarget | null;
  name: string;
  url: string;
  error: string | null;
  onNameChange: (name: string) => void;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onDelete?: () => void;
};

export function EditLinkDialog({
  target,
  name,
  url,
  error,
  onNameChange,
  onUrlChange,
  onSubmit,
  onClose,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const nameId = useId();
  const urlId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target && !el.open) el.showModal();
    if (!target && el.open) el.close();
  }, [target]);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
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
          onChange={(e) => onUrlChange(e.target.value)}
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
          onChange={(e) => onNameChange(e.target.value)}
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

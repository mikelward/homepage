import { useState } from 'react';
import { useLinks } from '../hooks/useLinks';
import type { LinkEntry } from '../lib/links';
import { EditLinkDialog, type EditTarget } from './EditLinkDialog';
import { LinkTile } from './LinkTile';
import './Home.css';

export function Home() {
  const { links, addLink, updateLink, removeLink } = useLinks();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState<EditTarget | null>(null);

  const closeDialog = () => setTarget(null);

  const saveDialog = (values: { name: string; url: string }) => {
    if (target?.kind === 'edit') {
      updateLink(target.link.id, values);
    } else {
      addLink(values.name, values.url);
    }
    closeDialog();
  };

  const deleteFromDialog = () => {
    if (target?.kind === 'edit') {
      removeLink(target.link.id);
    }
    closeDialog();
  };

  const removeTile = (link: LinkEntry) => removeLink(link.id);

  return (
    <main className="home">
      <header className="home__header">
        <h1 className="visually-hidden">homepage</h1>
        <button
          type="button"
          className="home__edit-toggle"
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </header>

      <div className="home__grid" data-testid="link-grid">
        {links.map((link) => (
          <LinkTile
            key={link.id}
            link={link}
            editing={editing}
            onEdit={(l) => setTarget({ kind: 'edit', link: l })}
            onRemove={removeTile}
          />
        ))}
        {editing && (
          <button
            type="button"
            className="home__add"
            onClick={() => setTarget({ kind: 'add' })}
            aria-label="Add link"
          >
            +
          </button>
        )}
      </div>

      <EditLinkDialog
        target={target}
        onClose={closeDialog}
        onSave={saveDialog}
        onDelete={target?.kind === 'edit' ? deleteFromDialog : undefined}
      />
    </main>
  );
}

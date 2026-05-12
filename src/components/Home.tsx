import { useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLinks } from '../hooks/useLinks';
import type { LinkEntry } from '../lib/links';
import { startSync } from '../lib/sync';
import { EditLinkDialog, type EditTarget } from './EditLinkDialog';
import { LinkTile } from './LinkTile';
import { SignInButton } from './SignInButton';
import './Home.css';

export function Home() {
  const { links, addLink, updateLink, removeLink, reorderLink } = useLinks();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState<EditTarget | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return startSync(user.uid);
  }, [user]);

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

  const handleDragStart = (e: DragEvent<HTMLDivElement>, link: LinkEntry) => {
    setDragId(link.id);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox to start the drag.
    e.dataTransfer.setData('text/plain', link.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, link: LinkEntry) => {
    if (dragId === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overId !== link.id) setOverId(link.id);
  };

  const handleDragLeave = (_e: DragEvent<HTMLDivElement>, link: LinkEntry) => {
    if (overId === link.id) setOverId(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, link: LinkEntry) => {
    e.preventDefault();
    if (dragId && dragId !== link.id) reorderLink(dragId, link.id);
    setDragId(null);
    setOverId(null);
  };

  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <main className="home">
      <header className="home__header">
        <h1 className="visually-hidden">homepage</h1>
        <SignInButton />
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
            dragging={dragId === link.id}
            dragOver={overId === link.id && dragId !== null && dragId !== link.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        ))}
        <button
          type="button"
          className="home__add"
          onClick={() => setTarget({ kind: 'add' })}
          aria-label="Add link"
        >
          +
        </button>
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

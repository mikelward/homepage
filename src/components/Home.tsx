import { useEffect, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
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

  // Activation constraints keep clicks/taps on the tile and delete buttons
  // working normally — a drag only starts after a short hold or a few
  // pixels of movement, so accidental drags from a tap don't fire.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderLink(String(active.id), String(over.id));
    }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={rectSortingStrategy}
        >
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
            <button
              type="button"
              className="home__add"
              onClick={() => setTarget({ kind: 'add' })}
              aria-label="Add link"
            >
              +
            </button>
          </div>
        </SortableContext>
      </DndContext>

      <EditLinkDialog
        target={target}
        onClose={closeDialog}
        onSave={saveDialog}
        onDelete={target?.kind === 'edit' ? deleteFromDialog : undefined}
      />
    </main>
  );
}

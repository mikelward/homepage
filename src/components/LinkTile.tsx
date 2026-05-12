import type { DragEvent } from 'react';
import type { LinkEntry } from '../lib/links';
import { LinkIcon } from './LinkIcon';
import './LinkTile.css';

type Props = {
  link: LinkEntry;
  editing: boolean;
  onEdit: (link: LinkEntry) => void;
  onRemove: (link: LinkEntry) => void;
  dragging?: boolean;
  dragOver?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, link: LinkEntry) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>, link: LinkEntry) => void;
  onDragLeave?: (e: DragEvent<HTMLDivElement>, link: LinkEntry) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>, link: LinkEntry) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
};

export function LinkTile({
  link,
  editing,
  onEdit,
  onRemove,
  dragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: Props) {
  if (editing) {
    const className = [
      'link-tile',
      'link-tile--editing',
      dragging ? 'link-tile--dragging' : '',
      dragOver ? 'link-tile--drag-over' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        className={className}
        draggable
        onDragStart={(e) => onDragStart?.(e, link)}
        onDragOver={(e) => onDragOver?.(e, link)}
        onDragLeave={(e) => onDragLeave?.(e, link)}
        onDrop={(e) => onDrop?.(e, link)}
        onDragEnd={(e) => onDragEnd?.(e)}
      >
        <button
          type="button"
          className="link-tile__body"
          onClick={() => onEdit(link)}
          aria-label={`Edit ${link.name}`}
        >
          <LinkIcon url={link.url} label={link.name} />
          <span className="link-tile__label">{link.name}</span>
        </button>
        <button
          type="button"
          className="link-tile__remove"
          onClick={() => onRemove(link)}
          aria-label={`Delete ${link.name}`}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <a
      href={link.url}
      className="link-tile link-tile__body"
      aria-label={link.name}
    >
      <LinkIcon url={link.url} label={link.name} />
      <span className="link-tile__label">{link.name}</span>
    </a>
  );
}

import type { LinkEntry } from '../lib/links';
import { LinkIcon } from './LinkIcon';
import './LinkTile.css';

type Props = {
  link: LinkEntry;
  editing: boolean;
  onEdit: (link: LinkEntry) => void;
  onRemove: (link: LinkEntry) => void;
};

export function LinkTile({ link, editing, onEdit, onRemove }: Props) {
  if (editing) {
    return (
      <div className="link-tile link-tile--editing">
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

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EditLinkDialog } from './EditLinkDialog';

// happy-dom's HTMLDialogElement doesn't (yet) flip `.open` from
// showModal() — stub the methods so React's render path doesn't throw,
// and the dialog stays in the document for queries.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EditLinkDialog', () => {
  it('renders nothing when target is null', () => {
    const { container } = render(
      <EditLinkDialog target={null} onClose={vi.fn()} onSave={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the Add title for an add target', () => {
    render(
      <EditLinkDialog
        target={{ kind: 'add' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('Add link')).toBeInTheDocument();
  });

  it('seeds the form for an edit target', () => {
    render(
      <EditLinkDialog
        target={{
          kind: 'edit',
          link: { id: 'a', name: 'Codex', url: 'https://chatgpt.com' },
        }}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('URL')).toHaveValue('https://chatgpt.com');
    expect(screen.getByLabelText(/Name/)).toHaveValue('Codex');
  });

  it('rejects an invalid URL', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditLinkDialog
        target={{ kind: 'add' }}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    await user.type(screen.getByLabelText('URL'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(/full URL/);
  });

  it('defaults name to the hostname when blank', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditLinkDialog
        target={{ kind: 'add' }}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    await user.type(screen.getByLabelText('URL'), 'https://example.com/path');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({
      name: 'example.com',
      url: 'https://example.com/path',
    });
  });

  it('calls onSave with trimmed values', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <EditLinkDialog
        target={{ kind: 'add' }}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    await user.type(screen.getByLabelText('URL'), '  https://a.test  ');
    await user.type(screen.getByLabelText(/Name/), '  A  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ name: 'A', url: 'https://a.test' });
  });

  it('shows a Delete button only for edit targets when onDelete is provided', () => {
    const { rerender } = render(
      <EditLinkDialog
        target={{ kind: 'add' }}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();

    rerender(
      <EditLinkDialog
        target={{
          kind: 'edit',
          link: { id: 'a', name: 'A', url: 'https://a.test' },
        }}
        onClose={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Delete' }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EditLinkDialog } from './EditLinkDialog';

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

const baseProps = {
  name: '',
  url: '',
  error: null,
  onNameChange: vi.fn(),
  onUrlChange: vi.fn(),
  onSubmit: vi.fn(),
  onClose: vi.fn(),
};

describe('EditLinkDialog', () => {
  it('renders nothing when target is null', () => {
    const { container } = render(
      <EditLinkDialog {...baseProps} target={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the Add title for an add target', () => {
    render(<EditLinkDialog {...baseProps} target={{ kind: 'add' }} />);
    expect(screen.getByText('Add link')).toBeInTheDocument();
  });

  it('displays the seeded values for an edit target', () => {
    render(
      <EditLinkDialog
        {...baseProps}
        target={{
          kind: 'edit',
          link: { id: 'a', name: 'Codex', url: 'https://chatgpt.com' },
        }}
        name="Codex"
        url="https://chatgpt.com"
      />,
    );
    expect(screen.getByLabelText('URL')).toHaveValue('https://chatgpt.com');
    expect(screen.getByLabelText(/Name/)).toHaveValue('Codex');
  });

  it('renders an error message when provided', () => {
    render(
      <EditLinkDialog
        {...baseProps}
        target={{ kind: 'add' }}
        error="Enter a full URL"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/full URL/);
  });

  it('calls onSubmit when Save is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <EditLinkDialog
        {...baseProps}
        target={{ kind: 'add' }}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows a Delete button only for edit targets when onDelete is provided', () => {
    const { rerender } = render(
      <EditLinkDialog
        {...baseProps}
        target={{ kind: 'add' }}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();

    rerender(
      <EditLinkDialog
        {...baseProps}
        target={{
          kind: 'edit',
          link: { id: 'a', name: 'A', url: 'https://a.test' },
        }}
        onDelete={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Delete' }),
    ).toBeInTheDocument();
  });
});

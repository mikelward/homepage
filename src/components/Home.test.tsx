import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { _resetLinksCacheForTests } from '../hooks/useLinks';
import { Home } from './Home';

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

beforeEach(() => {
  localStorage.clear();
  _resetLinksCacheForTests();
});

afterEach(() => {
  localStorage.clear();
  _resetLinksCacheForTests();
});

describe('Home', () => {
  it('renders the default newshacker tile', () => {
    render(<Home />);
    const grid = screen.getByTestId('link-grid');
    expect(
      within(grid).getByRole('link', { name: 'newshacker' }),
    ).toHaveAttribute('href', 'https://newshacker.app');
  });

  it('always shows the Add tile and exposes delete buttons in edit mode', async () => {
    const user = userEvent.setup();
    render(<Home />);

    expect(
      screen.getByRole('button', { name: 'Add link' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(
      screen.getByRole('button', { name: 'Add link' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete newshacker' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(
      screen.getByRole('button', { name: 'Add link' }),
    ).toBeInTheDocument();
  });

  it('adds a new link via the dialog and persists it', async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole('button', { name: 'Add link' }));

    await user.type(
      screen.getByLabelText('URL'),
      'https://chatgpt.com/codex/cloud',
    );
    await user.type(screen.getByLabelText(/Name/), 'Codex');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      screen.getByRole('link', { name: 'Codex' }),
    ).toHaveAttribute('href', 'https://chatgpt.com/codex/cloud');
  });

  it('removes a link via the tile delete button', async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(
      screen.getByRole('button', { name: 'Delete newshacker' }),
    );
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(
      screen.queryByRole('link', { name: 'newshacker' }),
    ).not.toBeInTheDocument();
  });
});

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InstallButton } from './InstallButton';

function fireBeforeInstallPrompt() {
  const userChoice = Promise.resolve({ outcome: 'accepted' as const });
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event('beforeinstallprompt'), {
    prompt,
    userChoice,
  });
  window.dispatchEvent(event);
  return { event, prompt, userChoice };
}

describe('InstallButton', () => {
  it('is hidden until the browser offers an install prompt', () => {
    render(<InstallButton />);
    expect(
      screen.queryByRole('button', { name: 'Install' }),
    ).not.toBeInTheDocument();
  });

  it('shows after beforeinstallprompt and triggers the native prompt on click', async () => {
    const user = userEvent.setup();
    render(<InstallButton />);

    let captured!: ReturnType<typeof fireBeforeInstallPrompt>;
    act(() => {
      captured = fireBeforeInstallPrompt();
    });

    const button = await screen.findByRole('button', { name: 'Install' });
    await user.click(button);

    expect(captured.prompt).toHaveBeenCalledTimes(1);
    await captured.userChoice;
    expect(
      screen.queryByRole('button', { name: 'Install' }),
    ).not.toBeInTheDocument();
  });

  it('hides itself when the app reports it was installed', () => {
    render(<InstallButton />);
    act(() => {
      fireBeforeInstallPrompt();
    });
    expect(
      screen.getByRole('button', { name: 'Install' }),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(
      screen.queryByRole('button', { name: 'Install' }),
    ).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkIcon } from './LinkIcon';

describe('LinkIcon', () => {
  it('renders the apple-touch-icon first', () => {
    render(<LinkIcon url="https://example.com" label="Example" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute(
      'src',
      'https://example.com/apple-touch-icon.png',
    );
    expect(img).toHaveAttribute('alt', 'Example');
  });

  it('falls back to the next candidate on error', () => {
    const { container } = render(<LinkIcon url="https://example.com" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/apple-touch-icon-precomposed.png',
    );
  });

  it('falls back through S2 to the inline globe SVG', () => {
    const { container } = render(<LinkIcon url="https://example.com" />);
    fireEvent.error(container.querySelector('img')!); // → precomposed
    fireEvent.error(container.querySelector('img')!); // → S2
    fireEvent.error(container.querySelector('img')!); // → globe SVG
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders the inline globe SVG for malformed URLs', () => {
    const { container } = render(<LinkIcon url="not a url" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});

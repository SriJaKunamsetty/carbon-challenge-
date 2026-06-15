import { render, screen } from '@testing-library/react';
import { SkipLink } from '@/components/ui/skip-link';

describe('SkipLink', () => {
  it('renders correctly', () => {
    render(<SkipLink targetId="main-content" />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('has correct target id', () => {
    render(<SkipLink targetId="main-content" />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });
});

import { render, screen } from '@testing-library/react';
import { AreaChart, DonutChart, BarChart } from '@/components/ui/svg-charts';

describe('SVG Charts', () => {
  describe('AreaChart', () => {
    it('renders with data', () => {
      const data = [{ label: 'Mon', value: 10 }, { label: 'Tue', value: 20 }];
      render(<AreaChart data={data} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getAllByText('Mon')[0]).toBeInTheDocument();
    });
  });

  describe('DonutChart', () => {
    it('renders with data', () => {
      const data = [{ name: 'Food', value: 30, color: '#ff0000' }];
      render(<DonutChart data={data} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getAllByText('Food')[0]).toBeInTheDocument();
      expect(screen.getAllByText('30')[0]).toBeInTheDocument();
    });
  });

  describe('BarChart', () => {
    it('renders with data', () => {
      const data = [{ label: 'A', value: 10 }];
      render(<BarChart data={data} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getAllByText('A')[0]).toBeInTheDocument();
    });
  });
});

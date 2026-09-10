import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from './page';

// 1. Mock the custom canplot library so it doesn't crash the JSDOM environment
jest.mock('@canplot/react', () => ({
  CanPlot: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canplot">{children}</div>,
  LinePlot: () => <div data-testid="mock-line-plot" />,
  ChartAreaInteractions: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-interactions">{children}</div>,
  TooltipsX: () => <div data-testid="mock-tooltip" />,
  Crosshair: () => <div data-testid="mock-crosshair" />,
}));

// Mock EventSource for SSE tests
class MockEventSource {
  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  static mockDataOverride: any = null;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      if (this.onmessage) {
        const dataToSend = MockEventSource.mockDataOverride || {
          leaderboard: [
            { name: "Alice Smith", total: 500.50 },
            { name: "Bob Jones", total: 300.00 }
          ],
          closestWarranty: {
            customerCompany: "Acme Corp",
            expirationDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            daysLeft: 5,
            salesmanName: "Alice Smith",
            warrantyType: "time"
          },
          chartData: [
            { date: "2026-08-01T10:00:00.000Z", salesman: "Alice Smith", cumulativeVolume: 200, annotation: "Sold 200L" }
          ]
        };

        this.onmessage({
          data: JSON.stringify(dataToSend)
        });
      }
    }, 10);
  }

  close() {}
}

Object.defineProperty(global, 'EventSource', {
  value: MockEventSource,
  writable: true,
});

describe('Dashboard UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.mockDataOverride = null;
  });

  it('renders the initial loading state before data arrives', () => {
    MockEventSource.mockDataOverride = {
      leaderboard: [],
      closestWarranty: null,
      chartData: []
    };

    render(<Dashboard />);

    expect(screen.getByText('Engine Oil Sales Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
    expect(screen.getByText('No active warranties found.')).toBeInTheDocument();
  });

  it('renders the leaderboard and warranty alert when data is fetched successfully', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Check Leaderboard
      const tableCells = screen.getAllByText('Alice Smith');
      expect(tableCells.length).toBeGreaterThan(0);
      expect(screen.getByText('500.50 L')).toBeInTheDocument();
      expect(screen.queryByText('Waiting for data...')).not.toBeInTheDocument();

      // Check Warranty Alert (zgodnie z mockiem dni left = 5)
      expect(screen.getByText('5 days left')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();

      // Check Chart wrapper
      expect(screen.getByTestId('mock-canplot')).toBeInTheDocument();
    });
  });

  it('hides a salesman from the chart when their toggle button is clicked', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const toggleButton = screen.getByRole('button', { name: 'Alice Smith' });
      expect(toggleButton).toBeInTheDocument();

      expect(toggleButton).toHaveClass('bg-blue-600');

      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveClass('bg-white');
    });
  });
});

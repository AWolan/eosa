import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './page';

// 1. Mock the custom canplot library so it doesn't crash the JSDOM environment
jest.mock('@canplot/react', () => {
  return function DummyCanplot() {
    return <div data-testid="mock-canplot">Chart Rendered</div>;
  };
});

describe('Dashboard UI', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders the initial loading state before data arrives', () => {
    // Mock fetch to return a never-resolving promise (simulating loading)
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByText('Engine Oil Sales Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Waiting for data...')).toBeInTheDocument();
    expect(screen.getByText('No active warranties found.')).toBeInTheDocument();
  });

  it('renders the leaderboard and warranty alert when data is fetched successfully', async () => {
    // Mock fetch to return specific dummy data
    const mockData = {
      leaderboard: [
        { name: 'Alice Smith', total: 500.5 },
        { name: 'Bob Johnson', total: 300.0 }
      ],
      closestWarranty: {
        customerCompany: 'Acme Corp',
        expirationDate: '2026-08-25T10:00:00.000Z',
        daysLeft: 16,
        salesmanName: 'Alice Smith',
        warrantyType: 'time'
      },
      chartData: []
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    ) as jest.Mock;

    render(<Dashboard />);

    // Wait for the async fetch to complete and update the UI
    await waitFor(() => {
      // Check Leaderboard
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('500.50 L')).toBeInTheDocument();
      expect(screen.queryByText('Waiting for data...')).not.toBeInTheDocument();

      // Check Warranty Alert
      expect(screen.getByText('16 days left')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();

      // Check Chart
      expect(screen.getByTestId('mock-canplot')).toBeInTheDocument();
    });
  });

  it('hides a salesman from the chart when their toggle button is clicked', async () => {
    // Setup minimal data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          leaderboard: [{ name: 'Alice Smith', total: 500.5 }],
          closestWarranty: null,
          chartData: []
        }),
      })
    ) as jest.Mock;

    render(<Dashboard />);

    await waitFor(() => {
      const toggleButton = screen.getByText('Alice Smith');

      // Initially, the button should have the active blue styling
      expect(toggleButton).toHaveClass('bg-blue-600');

      // Simulate clicking the toggle
      toggleButton.click();

      // The button should switch to the disabled grey styling
      expect(toggleButton).toHaveClass('bg-white text-slate-400');
    });
  });
});

import '@testing-library/jest-dom';

class MockEventSource {
  url: string;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  close() {}
}

// Podpinamy go pod globalny obiekt window
Object.defineProperty(global, 'EventSource', {
  value: MockEventSource,
  writable: true,
});

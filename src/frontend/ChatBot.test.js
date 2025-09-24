import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBot from './ChatBot';

// Mock the Forge components since they're not available in tests
jest.mock('@forge/react', () => ({
  Text: ({ children }) => <span>{children}</span>,
  TextArea: (props) => (
    <textarea 
      {...props}
      data-testid="chat-input"
    />
  ),
  Button: (props) => (
    <button 
      {...props}
      data-testid="send-button"
    />
  ),
  Box: ({ children }) => <div>{children}</div>,
  Stack: ({ children }) => <div>{children}</div>,
  Inline: ({ children }) => <div>{children}</div>
}));

// Mock the Forge bridge
jest.mock('@forge/bridge', () => ({
  invoke: jest.fn().mockResolvedValue('This is a test response from the AI.')
}));

describe('ChatBot', () => {
  it('renders without crashing', () => {
    render(<ChatBot />);
  });

  it('displays the initial bot message', () => {
    render(<ChatBot />);
    expect(screen.getByText('Hello! I am your AI Assistant. Please describe the issue you\'re experiencing and I\'ll help summarize it for you.')).toBeInTheDocument();
  });

  it('has an input field and send button', () => {
    render(<ChatBot />);
    expect(screen.getByPlaceholderText('[Type your message...]')).toBeInTheDocument();
    expect(screen.getByText('[Send]')).toBeInTheDocument();
  });
});
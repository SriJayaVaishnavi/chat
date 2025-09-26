import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatBot from './ChatBot';

// Mock the Forge components since they're not available in tests
jest.mock('@forge/react', () => ({
  Text: ({ children }) => <span>{children}</span>,
  TextArea: ({ value, onChange, placeholder }) => (
    <textarea 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      data-testid="chat-input"
    />
  ),
  Button: ({ children, onClick, isDisabled }) => (
    <button 
      onClick={onClick}
      disabled={isDisabled}
      data-testid="send-button"
    >
      {children}
    </button>
  ),
  Box: ({ children }) => <div>{children}</div>,
  Stack: ({ children }) => <div>{children}</div>,
  Inline: ({ children }) => <div>{children}</div>
}));

describe('ChatBot', () => {
  it('renders without crashing', () => {
    render(<ChatBot />);
  });

  it('displays the initial bot message', () => {
    render(<ChatBot />);
    expect(screen.getByText('🤖 AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Hello! I am your AI Assistant. How can I help you today?')).toBeInTheDocument();
  });

  it('has an input field and send button', () => {
    render(<ChatBot />);
    expect(screen.getByPlaceholderText('[Type your message...]')).toBeInTheDocument();
    expect(screen.getByText('[Send]')).toBeInTheDocument();
  });
});
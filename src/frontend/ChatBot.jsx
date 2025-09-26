import React, { useState, useEffect } from 'react';
import { Text, TextArea, Button, Box, Stack, Inline, Heading, Badge, Spinner, Link } from '@forge/react';
import { invoke, view } from '@forge/bridge';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your AI Assistant. Please describe the issue you\'re experiencing and I\'ll help summarize it for you.', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [projectKey, setProjectKey] = useState(null);
  const [publishingToKB, setPublishingToKB] = useState(false);
  const [siteUrl, setSiteUrl] = useState('https://srijayavaishnavi7.atlassian.net');
  const [testingConfluence, setTestingConfluence] = useState(false);

  // Get project context on component mount
  useEffect(() => {
    const getProjectContext = async () => {
      try {
        const context = await view.getContext();
        console.log('Project context:', context);
        if (context && context.extension && context.extension.project) {
          setProjectKey(context.extension.project.key);
        }
        // Try to get the site URL from context
        if (context && context.siteUrl) {
          setSiteUrl(context.siteUrl);
        }
      } catch (error) {
        console.error('Failed to get project context:', error);
      }
    };
    getProjectContext();
  }, []);

  const handleCreateTicket = async (messageText) => {
    setCreatingTicket(true);
    
    try {
      const result = await invoke('createTicket', {
        issueData: messageText,
        projectKey: projectKey,
        siteUrl: siteUrl
      });

      if (result.success) {
        // Add success message to chat
        const successMessage = {
          id: Date.now(),
          text: `✅ ${result.message}`,
          sender: 'bot',
          isTicketCreated: true,
          ticketKey: result.ticketKey,
          ticketUrl: result.ticketUrl,
          originalIssueData: messageText,  // Store the original AI response
          showActions: true
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        // Add error message to chat
        const errorMessage = {
          id: Date.now(),
          text: `❌ ${result.message}`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      const errorMessage = {
        id: Date.now(),
        text: `❌ Failed to create ticket: ${error.message}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setCreatingTicket(false);
    }
  };

  const handlePublishToKnowledgeBase = async (ticketKey, ticketUrl, issueData) => {
    setPublishingToKB(true);
    
    // Find the original AI response message that contains the Issue Summary
    let originalAIResponse = issueData;
    const aiMessage = messages.find(msg => 
      msg.text.includes('Issue Summary:') && 
      msg.text.includes('Next Steps:') && 
      msg.sender === 'bot'
    );
    
    if (aiMessage) {
      originalAIResponse = aiMessage.text;
      console.log('Found original AI response:', originalAIResponse);
    } else {
      console.log('Could not find original AI response, using:', issueData);
    }
    
    try {
      const result = await invoke('publishToKnowledgeBase', {
        ticketKey: ticketKey,
        ticketUrl: ticketUrl,
        issueData: originalAIResponse,
        projectKey: projectKey,
        siteUrl: siteUrl
      });

      if (result.success) {
        const successMessage = {
          id: Date.now(),
          text: `📚 Successfully created Knowledge Base article!`,
          sender: 'bot',
          isKBPublished: true,
          articleUrl: result.articleUrl,
          pageTitle: result.pageTitle
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        const errorMessage = {
          id: Date.now(),
          text: `❌ Failed to publish to Knowledge Base: ${result.message}`,
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error publishing to knowledge base:', error);
      const errorMessage = {
        id: Date.now(),
        text: `❌ Failed to publish to Knowledge Base: ${error.message}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setPublishingToKB(false);
    }
  };

  const handleTestConfluence = async () => {
    setTestingConfluence(true);
    
    try {
      const result = await invoke('testConfluence', {});
      
      const testMessage = {
        id: Date.now(),
        text: result.success 
          ? `✅ Confluence Test: ${result.message}. Found ${result.spaces} spaces.`
          : `❌ Confluence Test Failed: ${result.message} (Status: ${result.status})`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, testMessage]);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        text: `❌ Confluence Test Error: ${error.message}`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTestingConfluence(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 8000ms')), 8000);
      });
      
      const invokePromise = invoke('chatMessage', { message: currentInput });
      const response = await Promise.race([invokePromise, timeoutPromise]);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response || 'I received your message but couldn\'t generate a response.',
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // More specific error handling
      let errorMessage = "I apologize, but I'm having trouble processing your request right now. Please try again.";
      
      if (error.message?.includes('timeout') || error.message?.includes('8000ms')) {
        errorMessage = "⏱️ Request timed out. The service might be slow. Please try again in a moment.";
      } else if (error.message?.includes('bridge')) {
        errorMessage = "🔗 Connection issue detected. Please refresh the page and try again.";
      } else if (error.message?.includes('429')) {
        errorMessage = "⚠️ Service is busy. Please wait a moment before trying again.";
      } else if (error.message?.includes('403') || error.message?.includes('401')) {
        errorMessage = "🔐 Authentication issue. Please check your API configuration.";
      }
      
      // Fallback response
      const fallbackMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box padding="space.300" backgroundColor="color.background.neutral.subtle">
      {/* Header */}
      <Box 
        padding="space.200" 
        backgroundColor="color.background.brand.bold"
        xcss={{
          borderRadius: 'border.radius.200',
          marginBottom: 'space.200'
        }}
      >
        <Stack space="space.100">
          <Inline space="space.100" alignInline="center">
            <Text size="large" weight="bold" color="color.text.inverse">
              🤖 AI Assistant
            </Text>
            <Badge appearance="added" text="Online" />
          </Inline>
          <Inline space="space.100" alignInline="center">
            <Button
              onClick={handleTestConfluence}
              isDisabled={testingConfluence}
              appearance="subtle"
              size="compact"
            >
              {testingConfluence ? (
                <>
                  <Spinner size="xsmall" />
                  Testing...
                </>
              ) : (
                '🔍 Test Confluence'
              )}
            </Button>
          </Inline>
        </Stack>
      </Box>
      
      {/* Messages Container */}
      <Box 
        padding="space.200"
        backgroundColor="color.background.neutral"
        xcss={{
          borderRadius: 'border.radius.200',
          minHeight: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          marginBottom: 'space.200'
        }}
      >
        <Stack space="space.200">
          {messages.map((message) => (
            <Box key={message.id}>
              {message.sender === 'user' ? (
                // User message - right aligned
                <Box 
                  padding="space.150"
                  backgroundColor="color.background.brand.bold"
                  xcss={{
                    borderRadius: 'border.radius.200',
                    marginLeft: 'space.400'
                  }}
                >
                  <Inline space="space.100">
                    <Text size="small" weight="medium" color="color.text.inverse">
                      👤 You
                    </Text>
                  </Inline>
                  <Text color="color.text.inverse">{message.text}</Text>
                </Box>
              ) : (
                // Bot message - left aligned
                <Stack space="space.100">
                  <Box 
                    padding="space.150"
                    backgroundColor="color.background.neutral.subtle"
                    xcss={{
                      borderRadius: 'border.radius.200',
                      marginRight: 'space.400',
                      border: '1px solid var(--ds-border-neutral)'
                    }}
                  >
                    <Inline space="space.100">
                      <Text size="small" weight="medium" color="color.text.accent.blue">
                        🤖 Assistant
                      </Text>
                    </Inline>
                    <Text>{message.text}</Text>
                  </Box>
                  
                  {/* Show Create Ticket button for issue summaries (but not for welcome message or ticket creation confirmations) */}
                  {message.text.includes('Issue Summary:') && !message.isTicketCreated && message.id !== 1 && (
                    <Box xcss={{ marginRight: 'space.400' }}>
                      <Inline space="space.100" alignInline="start">
                        <Button
                          onClick={() => handleCreateTicket(message.text)}
                          isDisabled={creatingTicket || !projectKey}
                          appearance="primary"
                          size="compact"
                        >
                          {creatingTicket ? (
                            <>
                              <Spinner size="xsmall" />
                              Creating Ticket...
                            </>
                          ) : (
                            '🎫 Create Jira Ticket'
                          )}
                        </Button>
                        {projectKey && (
                          <Text size="small" color="color.text.subtlest">
                            Project: {projectKey}
                          </Text>
                        )}
                      </Inline>
                    </Box>
                  )}
                  
                  {/* Show ticket actions for successfully created tickets */}
                  {message.isTicketCreated && message.showActions && (
                    <Box xcss={{ marginRight: 'space.400' }}>
                      <Stack space="space.100">
                        <Inline space="space.100" alignInline="start">
                          <Link href={message.ticketUrl} openNewTab>
                            🔗 View Ticket {message.ticketKey}
                          </Link>
                        </Inline>
                        <Inline space="space.100" alignInline="start">
                          <Button
                            onClick={() => handlePublishToKnowledgeBase(message.ticketKey, message.ticketUrl, message.originalIssueData || message.text)}
                            isDisabled={publishingToKB}
                            appearance="subtle"
                            size="compact"
                          >
                            {publishingToKB ? (
                              <>
                                <Spinner size="xsmall" />
                                Publishing...
                              </>
                            ) : (
                              '📚 Publish to Knowledge Base'
                            )}
                          </Button>
                        </Inline>
                      </Stack>
                    </Box>
                  )}
                  
                  {/* Show knowledge base link for published articles */}
                  {message.isKBPublished && (
                    <Box xcss={{ marginRight: 'space.400' }}>
                      <Inline space="space.100" alignInline="start">
                        <Link href={message.articleUrl} openNewTab>
                          📖 View KB Article: {message.pageTitle || 'Knowledge Base Article'}
                        </Link>
                      </Inline>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <Box 
              padding="space.150"
              backgroundColor="color.background.neutral.subtle"
              xcss={{
                borderRadius: 'border.radius.200',
                marginRight: 'space.400',
                border: '1px solid var(--ds-border-neutral)'
              }}
            >
              <Inline space="space.100" alignInline="start">
                <Spinner size="small" />
                <Text size="small" color="color.text.subtlest">
                  Assistant is typing...
                </Text>
              </Inline>
            </Box>
          )}
        </Stack>
      </Box>
      
      {/* Input Area */}
      <Box 
        padding="space.200"
        backgroundColor="color.background.neutral"
        xcss={{
          borderRadius: 'border.radius.200'
        }}
      >
        <Stack space="space.150">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here... (Press Enter to send)"
            resize="vertical"
            minRows={2}
            maxRows={4}
          />
          <Inline space="space.100" alignInline="end">
            <Button 
              onClick={handleSubmit}
              isDisabled={!inputValue.trim() || isLoading}
              appearance="primary"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </Inline>
        </Stack>
      </Box>
    </Box>
  );
};

export default ChatBot;
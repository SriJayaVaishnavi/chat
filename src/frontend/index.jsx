import React from 'react';
import ForgeReconciler from '@forge/react';
import { view } from '@forge/bridge';
import { Box, Text } from '@forge/react';
import ChatBot from './ChatBot';

const App = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await view.getContext();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err.message);
        setIsReady(true);
      }
    };
    initializeApp();
  }, []);

  if (error) {
    return (
      <Box padding="space.200">
        <Text weight="bold" color="color.text.warning">⚠️ Initialization Warning</Text>
        <Text>Some features may not work properly: {error}</Text>
        <ChatBot />
      </Box>
    );
  }

  if (!isReady) {
    return (
      <Box padding="space.200">
        <Text>🔄 Loading...</Text>
      </Box>
    );
  }

  return (
    <React.Fragment>
      <ChatBot />
    </React.Fragment>
  );
};

ForgeReconciler.render(
  <App />
);

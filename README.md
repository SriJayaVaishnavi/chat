# Forge AI Assistant

This project contains a Forge app written in Javascript that displays a modern chatbot interface in a Jira project page. The AI Assistant provides mock responses based on user input with a sleek, professional design.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Features
- Modern chatbot UI inspired by Envato's design
- Message bubbles with distinct styling for user and bot messages
- Avatar indicators for both user and bot
- Typing indicators when the bot is "thinking"
- Contextual mock responses based on message content
- Responsive design suitable for Jira project sidebar
- Enter key support for message submission

## UI Design
- Clean, minimalist aesthetic with professional appearance
- Light blue background for a calm, tech-forward feel
- User messages on the left with light gray background
- Bot messages on the right with bright blue background
- Avatars for both user (👤) and bot (🤖)
- Smooth scrolling to latest messages
- Animated typing indicator when bot is processing

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start
- Install dependencies
```
npm install
```
- Modify your app frontend by editing the `src/frontend/ChatBot.jsx` file.

- Modify your app backend by editing the `src/resolvers/index.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in an Atlassian site by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.


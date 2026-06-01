# Contributing to Freqtrade Desktop

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Freqtrade installed and running with API server enabled

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/freqtrade-desktop.git
cd freqtrade-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start the Freqtrade API server (in a separate terminal):
```bash
freqtrade api-server --config user_data/config.json
```

4. Start the development server:
```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser.

### Electron Development

To test in Electron with native features (file system, notifications, tray):

```bash
npm run electron:dev
```

## Project Structure

- `src/pages/` - Page components (one per tab in the sidebar)
- `src/components/` - Reusable UI components organized by domain
- `src/hooks/` - Custom React hooks
- `src/lib/` - API client, WebSocket, utilities
- `src/types/` - TypeScript type definitions matching Freqtrade API schemas
- `electron/` - Electron main process and preload scripts

## Coding Guidelines

- **TypeScript** - All new code must be typed. Run `npm run lint` to check.
- **Tailwind CSS** - Use utility classes. Reference CSS variables in `index.css` for theme colors.
- **React Query** - Use for all server state. Never store API data in local state.
- **Component Design** - Keep components focused. Extract reusable pieces into `src/components/`.

## Submitting Changes

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes and ensure `npm run lint` passes
3. Test with `npm run build`
4. Commit with a clear message describing the change
5. Push and open a Pull Request

## Reporting Issues

When reporting bugs, please include:
- Freqtrade version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Browser console or Electron devtools errors

## Adding New API Endpoints

If Freqtrade adds new API endpoints:
1. Add TypeScript types in `src/types/freqtrade.ts`
2. Add the API method in `src/lib/api.ts`
3. Use the new endpoint in the appropriate page/component
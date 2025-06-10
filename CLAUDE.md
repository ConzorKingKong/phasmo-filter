# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `npm run dev` - Start Vite dev server
- **Build**: `npm run build` - Build for production
- **Lint**: `npm run lint` - Run ESLint with JSX support
- **Preview**: `npm run preview` - Preview production build
- **Start**: `npm start` - Start Express server (serves built files)

## Architecture

This is a React-based Phasmophobia ghost filtering tool that helps players identify ghosts based on evidence and hunt characteristics.

### Core Structure
- **App.jsx**: Main component with Material-UI theme, responsive layout (mobile drawer/desktop sidebar)
- **AppContext.jsx**: Global state management for ghost data, filters, search, and settings
- **Layout.jsx**: Base layout component
- **Ghost Data**: Static JSON file (`public/data/ghosts-v1-000-015.json`) with ghost information including evidence, speeds, hunt characteristics

### Key Components (src/components/features/)
- **EvidenceFilters.jsx**: Evidence selection and filtering interface
- **GhostCards.jsx**: Display filtered ghost results

### State Management
Global state via React Context includes:
- Ghost data and loading states
- Evidence filters (evidence, speed, hunt evidence)
- Search functionality
- Excluded ghosts
- Sort preferences
- User settings

### Tech Stack
- React 18 with Vite
- Material-UI v5 (dark theme, responsive design)
- Express server for production hosting
- Deployed to Cloudflare Pages

### Mobile Considerations
App is fully responsive with mobile-first drawer navigation and adaptive typography/spacing.
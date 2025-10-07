# Banking Journey Strategist Tool

An interactive configuration platform for designing and planning Banking Journey Orchestration Framework implementations.

## Overview

This tool enables strategists to:
- Build complete client profiles with data model configuration
- Map core banking fields to HubSpot custom objects
- Design custom tag systems using a visual rule builder
- Simulate member journeys with sample scenarios
- Export complete implementation specifications
- Save and iterate on client plans over time

## Relationship to Explainer Tool

This is a **separate interactive configuration tool** that works alongside the existing Banking Journey Orchestration Framework explainer (`banking-journey-framework/`):

- **Explainer Tool**: Educational/presentation tool that explains how the framework works
- **Strategist Tool** (this project): Interactive configuration tool for designing client-specific implementations

Both tools serve different but complementary purposes.

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Data Storage**: Local storage (with JSON export/import)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd strategist-tool
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or next available port).

## Project Structure

```
src/
├── features/              # Core modules (6 modules)
│   ├── client-profile/   # Module 1: Client Profile Builder ✅
│   ├── data-model/       # Module 2: Data Model Designer (coming soon)
│   ├── tag-designer/     # Module 3: Tag Library & Designer (coming soon)
│   ├── journey-simulator/# Module 4: Journey Simulator (coming soon)
│   ├── exporter/         # Module 5: Implementation Exporter (coming soon)
│   └── project-management/# Module 6: Project Dashboard ✅
├── components/
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components (Header, Sidebar)
├── context/              # React Context for state management
└── utils/                # Helper functions
```

## Implementation Status

### ✅ Completed
- Project structure and setup
- Navigation and routing
- Project management dashboard
- **Module 1: Client Profile Builder**
  - Basic Information form (FI details, demographics, products)
  - Integration Specifications form (export capabilities, security)
  - Form validation and auto-save
  - Local storage persistence

### 🚧 In Progress
- Module 2: Data Model Designer
- Module 3: Tag Library & Designer
- Module 4: Journey Simulator
- Module 5: Implementation Exporter

## Features

### Client Profile Builder (Module 1) ✅

**Basic Information:**
- FI details (name, type, size, location)
- Member demographics (count, tenure, age range)
- Product offerings (checking, loans, mortgages, etc.)
- Technology stack (core banking, CRM, website)
- HubSpot environment configuration

**Integration Specifications:**
- Export capabilities (method, format, frequency)
- Data security settings (SSN/account number handling)
- Compliance flags (PCI, GLBA)
- Integration platform selection
- Real-time security warnings

### Project Management ✅

- Create/open/delete projects
- Project dashboard with progress tracking
- Auto-save every 30 seconds
- Local storage persistence
- Version tracking

## Data Storage

Currently uses browser local storage for project persistence. Data is saved as JSON and can be exported/imported.

**Future enhancement**: Optional backend (Supabase/Firebase) for collaboration and cloud storage.

## Development Roadmap

### Phase 1 (Current)
- ✅ Project setup
- ✅ Module 1: Client Profile Builder
- 🚧 Module 2: Data Model Designer
- 🚧 Module 3: Tag Library & Designer

### Phase 2
- Module 4: Journey Simulator
- Module 5: Implementation Exporter
- Module 6: Version history & collaboration

### Phase 3
- Backend integration (optional)
- Real-time collaboration
- AI-powered suggestions
- Template marketplace

## Contributing

This is an internal tool for Epicosity strategic teams. For questions or feature requests, contact the development team.

## License

Proprietary - © 2025 Epicosity

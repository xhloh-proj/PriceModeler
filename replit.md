# Overview

This is a pricing and modeling studio application built as a full-stack TypeScript project. The application allows users to create, manage, and analyze pricing models for products or services through an interactive multi-step wizard interface. Users can define product details, configure cost structures (both fixed and variable costs), and perform demand analysis with financial projections and visualizations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a component-based architecture:
- **UI Framework**: React 18 with Vite as the build tool and development server
- **Styling**: Tailwind CSS with a custom design system based on shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state management and local React state for UI state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for data visualization and financial projections

## Backend Architecture
The server follows a RESTful API design using Express.js:
- **Framework**: Express.js with TypeScript
- **API Structure**: REST endpoints under `/api` prefix for pricing project CRUD operations
- **Validation**: Zod schemas for request/response validation
- **Storage Interface**: Abstracted storage layer with IStorage interface, currently implemented with in-memory storage (MemStorage class)
- **Error Handling**: Centralized error handling middleware with structured error responses

## Database Schema
Uses Drizzle ORM with PostgreSQL dialect:
- **Primary Entity**: `pricing_projects` table with comprehensive pricing model data
- **Data Types**: Supports JSON fields for complex data structures (cost arrays, multipliers)
- **Schema Generation**: Type-safe schema definitions with automatic TypeScript inference
- **Migrations**: Drizzle Kit for database migrations and schema management

## Component Architecture
- **Multi-step Wizard**: Organized into discrete steps (Product Setup, Cost Structure, Demand Analysis)
- **Shared Components**: Reusable UI components in `/components/ui` following shadcn/ui patterns
- **Step Components**: Specialized components for each wizard step with controlled data flow
- **Layout Components**: Header navigation and sidebar for consistent user experience

## Type Safety
- **Shared Types**: Common TypeScript interfaces in `/shared` directory
- **Schema Validation**: Zod schemas for runtime validation and TypeScript type generation
- **API Contracts**: Type-safe API communication between client and server

## Development Setup
- **Monorepo Structure**: Client and server code in single repository with shared dependencies
- **Path Aliases**: Configured aliases for clean imports (`@/`, `@shared/`)
- **Development Tools**: TSC for type checking, ESBuild for server bundling, Vite for client bundling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless)
- **Connection**: Uses DATABASE_URL environment variable for connection string
- **ORM**: Drizzle ORM for type-safe database operations

## UI and Design System
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: For creating type-safe component variants

## Charts and Visualization
- **Recharts**: React charting library built on D3 for financial projections and data visualization
- **Date-fns**: Date utility library for time-based calculations

## Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **ESBuild**: Fast JavaScript bundler for server-side code
- **Replit Integration**: Custom Vite plugins for Replit environment support

## Validation and Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms library with minimal re-renders
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for schema validation

## Session Management
- **Connect PG Simple**: PostgreSQL session store for Express sessions (configured but not actively used in current implementation)
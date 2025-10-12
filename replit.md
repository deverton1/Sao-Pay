# São Pay - Sistema SaaS para Igreja

## Overview

São Pay is a SaaS system designed for churches to manage virtual wallets with QR Code technology. The system consists of three main user roles:

1. **Admin** - Complete system administration and oversight
2. **Caixa (Cashier)** - Issues virtual wallets with balance via QR Code
3. **Barraca (Vendor)** - Scans QR Codes and debits purchases from wallets

The application enables a cashless transaction flow where the central cashier loads money onto virtual wallets, and vendors can accept payments by scanning QR codes, creating a complete closed-loop payment system for church events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and dev server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Shadcn/ui components based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Material Design principles adapted for church administrative use
- Role-based color theming (Admin: Blue, Caixa: Teal, Barraca: Purple)
- Dark/light theme support with persistent user preferences

**State Management:**
- React Query for server state and API caching
- Local storage for authentication tokens and user session data
- Component-level state with React hooks for UI interactions

### Backend Architecture

**Server Framework:**
- Node.js with Express for REST API
- TypeScript for type safety across the stack
- Custom middleware for authentication and error handling

**Authentication & Authorization:**
- JWT (JSON Web Tokens) for stateless authentication
- bcrypt.js for password hashing
- Role-based access control (RBAC) with three distinct user types
- Token-based middleware protecting API routes by role

**API Design:**
- RESTful endpoints organized by user role (/api/admin, /api/caixa, /api/barraca)
- Centralized error handling middleware
- Request/response logging for debugging
- JSON-based request/response format

### Data Storage

**Database:**
- PostgreSQL as the primary database (via Neon serverless)
- Drizzle ORM for type-safe database queries
- Schema-first approach with TypeScript types generated from database schema

**Data Model:**
- **usuarios** - Stores all user types (admin, caixa, barraca) with authentication credentials
- **responsaveis** - Links responsible persons to user accounts (contact info, CPF)
- **carteiras** - Virtual wallets with balance, QR code numbers, and status tracking
- **vendas_caixa** - Transaction log for wallet issuance at cashier
- **vendas_barracas** - Transaction log for purchases at vendors

**Key Design Decisions:**
- Single user table with role differentiation via 'tipo' field (admin/caixa/barraca)
- Wallet numbers as unique identifiers encoded in QR codes
- Separate transaction tables for audit trail and reporting
- Soft status management (ativo/inativo/usado/expirado) rather than hard deletes

### External Dependencies

**Core Dependencies:**
- **@neondatabase/serverless** - Serverless PostgreSQL database connection
- **drizzle-orm** & **drizzle-kit** - Type-safe ORM and migration tools
- **bcryptjs** - Password hashing for secure authentication
- **jsonwebtoken** - JWT token generation and verification
- **nanoid** - Unique ID generation for wallet numbers

**UI Libraries:**
- **@radix-ui/react-*** - Accessible, unstyled component primitives (30+ components)
- **@tanstack/react-query** - Server state management and caching
- **react-hook-form** & **@hookform/resolvers** - Form handling with validation
- **zod** & **drizzle-zod** - Schema validation on client and server
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** & **clsx** - Dynamic className composition
- **date-fns** - Date formatting and manipulation
- **lucide-react** - Icon library

**Development Tools:**
- **vite** - Fast build tool and dev server
- **tsx** - TypeScript execution for Node.js
- **esbuild** - Production bundler for server code
- **@replit/vite-plugin-*** - Replit-specific development enhancements

**Notable Architectural Choices:**
- Monorepo structure with shared schema between client and server (`/shared/schema.ts`)
- In-memory storage fallback (`MemStorage` class) for development/testing
- Client-side QR code generation using canvas (avoiding external QR libraries)
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)
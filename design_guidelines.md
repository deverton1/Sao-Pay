# Design Guidelines: São Pay - Sistema SaaS para Igreja

## Design Approach: Material Design System
**Justification**: This is a utility-focused, data-intensive administrative application requiring clear information hierarchy, efficient workflows, and multi-role interfaces. Material Design provides excellent patterns for forms, data tables, and dashboard layouts with strong accessibility support.

## Core Design Principles
1. **Clarity Over Decoration**: Prioritize readability and task completion
2. **Role-Based Visual Hierarchy**: Clear differentiation between Admin, Caixa, and Barraca interfaces
3. **Operational Efficiency**: Minimize clicks, maximize visibility of critical information
4. **Trust & Reliability**: Professional appearance suitable for church financial operations

---

## Color Palette

### Light Mode
- **Primary (Admin)**: 220 90% 50% (Rich Blue - authority and trust)
- **Primary (Caixa)**: 160 60% 45% (Teal Green - transactions and money)
- **Primary (Barraca)**: 280 50% 50% (Purple - vendor operations)
- **Background**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Text Primary**: 220 15% 20%
- **Text Secondary**: 220 10% 45%
- **Border**: 220 15% 88%

### Dark Mode
- **Primary (Admin)**: 220 85% 60%
- **Primary (Caixa)**: 160 55% 55%
- **Primary (Barraca)**: 280 45% 60%
- **Background**: 220 15% 10%
- **Surface**: 220 12% 14%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 220 5% 65%
- **Border**: 220 10% 25%

### Semantic Colors (Both Modes)
- **Success**: 140 60% 45% (light) / 140 55% 55% (dark)
- **Error**: 0 70% 50% (light) / 0 65% 60% (dark)
- **Warning**: 35 90% 55% (light) / 35 85% 60% (dark)
- **Info**: 200 80% 50% (light) / 200 75% 60% (dark)

---

## Typography

### Font Families
- **Primary**: 'Inter', system-ui, -apple-system, sans-serif (all interfaces)
- **Monospace**: 'JetBrains Mono', 'Courier New', monospace (wallet numbers, QR codes)

### Scale & Weights
- **Headings H1**: 2rem (32px), font-weight 700, letter-spacing -0.02em
- **Headings H2**: 1.5rem (24px), font-weight 600, letter-spacing -0.01em
- **Headings H3**: 1.25rem (20px), font-weight 600
- **Body Large**: 1rem (16px), font-weight 400, line-height 1.6
- **Body Regular**: 0.875rem (14px), font-weight 400, line-height 1.5
- **Caption/Label**: 0.75rem (12px), font-weight 500, letter-spacing 0.02em, uppercase
- **Wallet Numbers**: 1.125rem (18px), font-weight 600, monospace

---

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: mb-8 to mb-12
- Form field gaps: space-y-4
- Card padding: p-6
- Table cell padding: px-4 py-3

### Grid & Containers
- **Max Width**: max-w-7xl (dashboards), max-w-2xl (forms)
- **Admin Dashboard**: 2-column layout (sidebar 280px + main content)
- **Caixa/Barraca Dashboards**: Single column with max-w-4xl for focused workflows
- **Form Layouts**: Single column max-w-xl for optimal completion
- **Data Tables**: Full width with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Admin Sidebar**: Fixed left, 280px wide, hierarchical menu with role badge
- **Caixa/Barraca Header**: Top bar with logo, user info, logout (h-16)
- **Breadcrumbs**: For admin multi-level navigation

### Forms & Inputs
- **Input Fields**: h-11, rounded-lg, border-2, focus ring with primary color
- **Labels**: font-weight 500, mb-2, text-sm
- **Select Dropdowns**: Consistent styling with input fields, chevron icon
- **Buttons Primary**: h-11, rounded-lg, font-weight 600, shadow-sm
- **Buttons Secondary**: h-11, rounded-lg, border-2, transparent background
- **Form Sections**: Grouped with bg-surface, rounded-xl, p-6, shadow-sm

### Data Display
- **Cards**: rounded-xl, shadow-sm, p-6, border on dark mode
- **Tables**: Zebra striping (odd rows with subtle bg), sticky headers, hover states
- **Table Headers**: font-weight 600, border-b-2, text-sm, uppercase
- **Status Badges**: rounded-full, px-3, py-1, font-weight 600, text-xs
- **QR Code Display**: Centered card, max-w-sm, white background always, p-8

### Modals & Overlays
- **Modal Background**: Backdrop blur-sm, bg-black/50
- **Modal Container**: max-w-md to max-w-2xl, rounded-2xl, shadow-2xl
- **QR Scanner Overlay**: Full screen, camera feed with centered scan area guide

### Feedback Elements
- **Toast Notifications**: Fixed top-right, slide-in animation, auto-dismiss
- **Loading States**: Spinner with primary color, skeleton screens for tables
- **Empty States**: Centered icon + text + action button, max-w-md

---

## Dashboard-Specific Layouts

### Admin Dashboard
- **Header**: Statistics cards in 3-column grid (total carteiras, vendas hoje, saldo total)
- **Main Content**: Tabbed interface (Caixas, Barracas, Relatórios)
- **CRUD Tables**: Action buttons (Editar, Excluir) in last column, search/filter bar above
- **Responsáveis Section**: Nested under each Caixa/Barraca with expandable details

### Caixa Dashboard
- **Primary Action Card**: Emissão de carteira form, prominent position, max-w-xl
- **QR Code Display**: Large, white background, with download/print buttons
- **Recent Emissions**: Table below, 5 most recent with status indicators
- **Quick Stats**: Mini cards showing today's total value and count

### Barraca Dashboard
- **Scanner Area**: Large camera preview or upload zone, center stage
- **Saldo Display**: Large typography when wallet detected, real-time update
- **Transaction Form**: Compact, inline below saldo display
- **History Table**: Scrollable, shows last 20 transactions with timestamps

---

## Interaction Patterns

### QR Code Workflow
1. **Generation (Caixa)**: Instant display after form submission, fade-in animation
2. **Scanning (Barraca)**: Camera permission prompt, target zone overlay, success vibration/sound
3. **Manual Entry**: Fallback input field for wallet number if scan fails

### Form Validation
- Inline error messages below fields (text-error)
- Success state with green border and checkmark
- Disabled submit until validation passes

### Data Loading
- Skeleton loaders for tables (3 rows, pulsing gray bars)
- Spinner overlay for critical operations (transactions)
- Progressive loading for long lists (pagination or infinite scroll)

---

## Accessibility & Responsive Behavior

### Mobile Adaptations (< 768px)
- Admin sidebar collapses to bottom sheet/drawer
- Tables convert to stacked cards showing key data
- QR scanner fills entire viewport
- Forms maintain single column, full width

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus visible rings (2px offset, primary color)
- Escape closes modals/overlays
- Enter submits forms

### Dark Mode
- Automatic system preference detection with manual toggle
- Persistent user preference in localStorage
- Ensure all form inputs have proper dark backgrounds
- Increased border contrast for separators

---

## Images & Illustrations

### Login Screens
- **Abstract Pattern Background**: Subtle gradient mesh in brand colors (20% opacity)
- **Logo Placement**: Centered above form, max height 80px

### Empty States
- **No Data Illustrations**: Simple line-art icons (cart, wallet, document) at 120px size
- **404/Error Pages**: Friendly illustration with church motif (stained glass pattern)

### QR Code Context
- Always on pure white (#FFFFFF) background for optimal scanning
- Minimum size 200x200px, centered in card
- Print-friendly styling (remove shadows in print CSS)

---

## Special Considerations

### Transaction Security Visual Cues
- Lock icon next to secure operations
- Success confirmation with animated checkmark
- Error states with clear retry options
- Transaction receipt modal with print option

### Multi-Role Color Coding
- Admin pages: Blue accent borders on navigation
- Caixa pages: Teal accent in header and primary buttons
- Barraca pages: Purple accent throughout interface
- Subtle role badge in top-right corner of all dashboards
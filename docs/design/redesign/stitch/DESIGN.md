---
name: Routine & Money Slate Minimal
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#004f35'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a48'
  on-tertiary-container: '#60eeb1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a focused, reassuring, and analytical environment for personal finance and habit-driven wealth tracking. The aesthetic balances crisp utilitarian clarity with contemporary SaaS polish: calm, high-transparency, and distraction-free.

### Design Movements & Tone
- **Corporate Minimalism & Modern Fintech:** Built on neutral slate surfaces, strict typographic hierarchy, and intentional high-contrast accents.
- **Micro-Tactile Clarity:** Tactile interactions relying on subtle elevation, delicate borders, and pill/rounded card contours to make complex financial telemetry feel approachable and structured.
- **Target Emotional Response:** Confidence, discipline, control, and absolute clarity over recurrent cash flows.

## Colors

The palette is tuned specifically for numerical data density, legibility, and unmistakable financial polarity.

### Role Assignments
- **Primary (`#1D4ED8`):** Anchors main actions, selected tab states, focus rings, and primary interactive components.
- **Secondary (`#6366F1`):** Represents auxiliary analytics, forecast routines, and subtle interactive badges.
- **Tertiary / Positive Flow (`#10B981`):** Indicates income, savings targets achieved, net-worth growth, and positive cash flow.
- **Expense / Outflow (`#F43F5E`):** Distinct coral-rose reserved strictly for debits, budget limits exceeded, and liabilities.
- **Recurring / Cautionary Alert (`#F59E0B`):** Reserved for routine recurring subscriptions, upcoming bills, and pending status tags.
- **Neutral Primary (`#0F172A`):** Deep navy for primary headings, metric values, and high-emphasis body text.
- **Neutral Muted (`#64748B`):** Supporting slate for secondary labels, table headers, and timestamp metadata.
- **Surface Foundations:** Background layers transition from canvas `#F8FAFC` to pure white `#FFFFFF` for primary cards, bounded by micro-borders `#E2E8F0`.

## Typography

The typography leverages Inter for its balance, clear numerals, and wide Korean glyph support in digital fintech environments.

### Typographic Rules
- **Tabular Numerals (`font-variant-numeric: tabular-nums`):** Must be enforced across all ledger balances, summary totals, percentage variations, and charts to prevent horizontal jitter during updates.
- **Visual Weighting:** Numbers take optical precedence over units. Financial currency marks (₩, $, etc.) are rendered one scale smaller or weighted at medium (`500`) against bold metric totals.
- **Hierarchy of Context:** Labels preceding financial metrics always utilize uppercase or medium-weight tracking to distinguish structural navigation from ledger data.

## Layout & Spacing

The layout is built around a flexible 12-column dashboard grid optimized for information ingestion.

### Grid & Form Factors
- **Desktop (>= 1280px):** 12-column layout with fixed 260px collapsible sidebar navigation, 24px (`1.5rem`) gutters, and dynamic content max-width pegged at 1600px.
- **Tablet (768px - 1279px):** 8-column layout with icon-rail sidebar navigation, 16px gutters, and stacked summary rows.
- **Mobile (< 768px):** Single-column fluid view with pinned bottom navigation, 16px page margins, and horizontally scrollable metric strips.

### Spatial Rhythm
- Metric panels enforce an internal padding of `space-lg` (24px) for desktop and `space-md` (16px) for compact viewports.
- Related list items within cards maintain an 8px (`space-sm`) vertical gap, while discrete dashboard card modules separate by `space-xl` (32px).

## Elevation & Depth

Visual hierarchy is maintained through crisp surface isolation rather than deep dramatic drops. The system pairs clean borders with multi-stop ambient light shadows.

### Elevation Levels
- **Level 0 (Canvas Base):** Background `#F8FAFC`, flat.
- **Level 1 (Cards, Modules, Table Containers):** `#FFFFFF` surface enclosed by a 1px border of `#E2E8F0`, supported by an ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Dropdowns, Popovers, Segmented Switchers):** Floating elements resting on `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)` with a hairline `#E2E8F0` border.
- **Level 3 (Modal Dialogs, Slide-over Transaction Drawers):** High-prominence overlays featuring `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)`, masked by a backdrop blur of `rgba(15, 23, 42, 0.35)`.

## Shapes

The interface embraces a gentle modern curvature (`rounded-2xl` on large modules, `rounded-xl` / `rounded-lg` on inner interactive components), balancing playful accessibility with analytical reliability.

### Corner Curvature Standards
- **Containers & Primary Cards:** 16px (`1rem` / `rounded-2xl`) outer corner radius.
- **Inputs, Buttons, and Data Table Rows:** 8px to 10px (`rounded-lg`) for compact visual containment.
- **Pills, Transaction Tags, and Status Chips:** Full pill radius (`9999px`) to immediately distinguish contextual tags from interactive card surfaces.

## Components

### Buttons
- **Primary:** Solid `#1D4ED8` background, `#FFFFFF` text, `font-weight: 600`, subtle press-down transform `scale(0.99)`, hover state `#1E40AF`, focused with an outer 3px ring of `rgba(37, 99, 235, 0.2)`.
- **Secondary:** Surface `#FFFFFF`, border 1px `#E2E8F0`, text `#0F172A`, hover background `#F1F5F9`.
- **Destructive:** Background `#FEE2E2`, text `#DC2626`, hover background `#FECACA`.

### Cards & Financial Tiles
- Encapsulated in 16px radius pure white boxes bordered with 1px `#E2E8F0`.
- KPI Tiles feature a top micro-label in slate `#64748B`, an oversize balance in `#0F172A` tabular numerals, and a bottom row containing positive (`#10B981`) or negative (`#F43F5E`) delta pills alongside mini sparkline charts.

### Chips & Badges
- **Income Chip:** Background `#ECFDF5`, text `#047857`, 1px border `#A7F3D0`.
- **Expense Chip:** Background `#FFF1F2`, text `#BE123C`, 1px border `#FECDD3`.
- **Recurring / Routine Chip:** Background `#FEF3C7`, text `#B45309`, 1px border `#FDE68A`.
- Sizing: 24px height, padding horizontal 10px, typography `label-sm`.

### Input Fields
- Background `#FFFFFF`, 1px solid border `#CBD5E1`, 8px corner radius, padding `10px 14px`.
- Active / Focus: Border changes to `#1D4ED8` with a 3px matching glow (`rgba(29, 78, 216, 0.15)`).
- Monospaced numerical alignment for currency inputs with trailing fixed labels (e.g., `KRW`, `USD`).

### Checkbox & Radio Buttons
- 18px dimensions, 4px corner radius for checkboxes, circle for radio buttons.
- Inactive state: Border 1.5px `#CBD5E1` against white.
- Active state: Solid `#1D4ED8` with crisp white SVG check/dot indicator.

### Ledger & Transaction Lists
- Row layout with hover fill transitioning smoothly to `#F8FAFC`.
- Left: Category icon housed inside a 40px rounded-xl squircle container tinted to category color.
- Middle: Transaction merchant and routine recurrence subtext (`body-md` / `body-sm`).
- Right: Right-aligned tabular currency amount, colored `#10B981` (prefixed with `+`) for incoming or `#0F172A` for spending.
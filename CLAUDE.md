# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run build:debug  # Production build with debug output
npm start            # Start production server (port 3001)
npm run lint         # Run ESLint with auto-fix
npm run prettier     # Check formatting with Prettier
npm run cy:open      # Open Cypress interactive test runner
npm run cy:run       # Run Cypress e2e tests headlessly in Chrome
```

## Architecture

This is a **Next.js 16 App Router** e-commerce project with TypeScript, Tailwind CSS v4, and shadcn/ui.

### Directory structure

- `app/` — Next.js routes and API handlers (App Router)
  - `app/api/` — API routes: `products`, `product/[id]`, `product/[id]/recommendations`, `order`, `order/[orderNo]`, `order/validateCart`, `home`, `revalidate/product`
  - Page routes: `/` (home), `/products`, `/product/[id]`, `/cart`, `/checkout`, `/order/complete`, `/order/lookup`
- `components/` — React components
  - `components/ui/` — shadcn/ui primitives (button, carousel, dropdownMenu, input, navigationMenu, skeleton)
  - `components/features/` — Feature-specific components grouped by domain (`home/`, `product/`, `products/`, `order/`, `cart/`)
  - `components/common/` — Shared UI (Header, LanguageSwitcher, ErrorFallback, `product/ProductCard`, `product/ProductCardSkeleton`)
  - `components/layout/` — Layout shells (AppChrome, PaymentFlowLayout)
- `server/` — Server-only code
  - `server/dataSource/` — Data access layer (`productSource.ts`, `orderSource.ts`)
  - `server/db/` — JSON flat-file "databases" (`PRODUCTS.json`, `ORDER.json`)
- `shared/` — Code shared between server and client
  - `shared/hooks/` — Zustand stores: `useCart.ts` (persisted to localStorage), `useCheckoutInfo.ts` (persisted to localStorage)
  - `shared/utils/` — `currency.ts` (Intl.NumberFormat with cached formatters, default TWD/zh-TW), `domain.ts` (constructs base URL from env vars)
  - `shared/constants.ts` — Language options, currency options, payment methods (credit-card, ATM, COD)
- `lib/` — Utilities
  - `lib/api/client.ts` — Axios-based API client (10s timeout, absolute URL on server / relative on client, abort controller support)
  - `lib/api/error.ts` — `ApiError`, `NormalizedError`, `ErrorType` enum, `normalizeError()`
  - `lib/api/abort.ts` — `AbortManager` interface for managing `AbortController` instances
  - `lib/logger/index.ts` — `logApiError()`, `logError()` (console-based, prepared for external error reporting)
  - `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `cypress/` — Cypress e2e tests
  - `cypress/e2e/order/create-order.cy.ts` — Checkout flow tests (success, empty cart, validation error)

### Key architectural decisions

**Data layer**: Products and orders are stored in JSON files (`server/db/`). The data source layer (`server/dataSource/`) reads these files and exposes typed async functions. Intentional `sleep()` delays simulate network latency (300–1000ms).

**Pagination**: Products use cursor-based pagination. The `next` cursor is the `id` of the first item on the next page.

**Cart**: Sessionless — stored entirely in `localStorage` via Zustand `persist` middleware (`ecommerce-cart-storage`). No server-side cart session.

**Checkout flow**: Three-step wizard managed in `CheckoutPageClient`. Step 1 collects shipping/payment info (validated via react-hook-form + `/api/order/validateCart`), Step 2 shows confirmation, Step 3 processes payment. Checkout info is also persisted to localStorage (`ecommerce-checkout-info-storage`).

**Rendering strategy**: Home and product list pages use SSR. Product detail pages use ISR with an `/api/revalidate/product` endpoint. Heavy components (checkout steps, BrandStorySection) use `next/dynamic` for lazy loading. Recommendation sections use client-side fetching.

**API client**: `lib/api/client.ts` wraps Axios. On the server side, it uses an absolute base URL (from `shared/utils/domain.ts`). On the client, it uses relative paths. Supports abort keys via `AbortController` managed through `AbortManager`.

**Header visibility**: `AppChrome` hides the header on `/cart`, `/checkout*`, and `/order/complete*` (payment flow pages use `PaymentFlowLayout` instead).

**Error handling**: `lib/api/error.ts` normalizes all API errors into `NormalizedError` with typed `ErrorType` (abort, timeout, network, client, server, unknown). Each feature has an `api.ts` for client-side calls and a `server-api.ts` for server-side calls.

### Code style

- Prettier: single quotes, no semicolons, 120 char print width, no trailing commas, JSX single quotes
- ESLint: Next.js core web vitals + TypeScript rules, integrated with Prettier
- shadcn/ui "new-york" style, Lucide icons, Tailwind CSS v4 with CSS variables
- Path alias `@/` maps to the project root

### Key dependencies

| Package | Purpose |
|---------|---------|
| `next@16` | React framework with App Router |
| `react@19` | UI library |
| `axios` | HTTP client (wrapped in `lib/api/client.ts`) |
| `zustand@5` | State management for cart and checkout info |
| `react-hook-form` | Form handling in checkout step 1 |
| `@radix-ui/*` | Headless UI primitives (via shadcn/ui) |
| `embla-carousel-react` | Carousel component |
| `react-phone-number-input` | Phone number input in checkout |
| `lucide-react` | Icon library |
| `tailwindcss@4` | CSS utility framework |
| `cypress` | E2E testing framework |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Production build
npm run lint      # Run ESLint with auto-fix
npm run prettier  # Check formatting with Prettier
```

No test runner is configured yet (unit/E2E tests are a planned TODO).

## Architecture

This is a **Next.js 16 App Router** e-commerce project with TypeScript, Tailwind CSS v4, and shadcn/ui.

### Directory structure

- `app/` — Next.js routes and API handlers (App Router)
  - `app/api/` — API routes: `products`, `product/[id]`, `product/[id]/recommendations`, `order`, `order/[orderNo]`, `order/validateCart`, `home`
  - Page routes: `/` (home), `/products`, `/product/[id]`, `/cart`, `/checkout`, `/order/complete`, `/order/lookup`
- `components/` — React components
  - `components/ui/` — shadcn/ui primitives (button, carousel, skeleton, etc.)
  - `components/features/` — Feature-specific components grouped by domain (`home/`, `product/`, `order/`, `cart/`)
  - `components/common/` — Shared UI (Header, LanguageSwitcher, ErrorFallback)
  - `components/layout/` — Layout shells (AppChrome, PaymentFlowLayout)
- `server/` — Server-only code
  - `server/dataSource/` — Data access layer (`productSource.ts`, `orderSource.ts`)
  - `server/db/` — JSON flat-file "databases" (`PRODUCTS.json`, `ORDER.json`)
- `shared/` — Code shared between server and client
  - `shared/hooks/` — Zustand stores: `useCart.ts` (persisted to localStorage), `useCheckoutInfo.ts` (persisted to localStorage)
  - `shared/utils/` — `currency.ts`, `domain.ts`
  - `shared/constants.ts` — Language options, currency options, payment methods
- `lib/` — Utilities
  - `lib/api/client.ts` — Axios-based API client with abort controller support
  - `lib/api/error.ts` — `ApiError` and `NormalizedError` types
  - `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Key architectural decisions

**Data layer**: Products and orders are stored in JSON files (`server/db/`). The data source layer (`server/dataSource/`) reads these files and exposes typed async functions. Intentional `sleep()` delays simulate network latency.

**Pagination**: Products use cursor-based pagination. The `next` cursor is the `id` of the first item on the next page.

**Cart**: Sessionless — stored entirely in `localStorage` via Zustand `persist` middleware (`ecommerce-cart-storage`). No server-side cart session.

**Checkout flow**: Three-step wizard managed in `CheckoutPageClient`. Step 1 collects shipping/payment info (validated via react-hook-form + `/api/order/validateCart`), Step 2 shows confirmation, Step 3 processes payment. Checkout info is also persisted to localStorage (`ecommerce-checkout-info-storage`).

**Rendering strategy**: Product list pages use SSR; individual product pages and recommendation sections use client-side fetching. Heavy components (checkout steps, BrandStorySection) use `next/dynamic` for lazy loading.

**API client**: `lib/api/client.ts` wraps Axios. On the server side, it uses an absolute base URL (from `shared/utils/domain.ts`). On the client, it uses relative paths. Supports abort keys via `AbortController`.

**Header visibility**: `AppChrome` hides the header on `/cart`, `/checkout*`, and `/order/complete*` (payment flow pages use `PaymentFlowLayout` instead).

### Code style

- Prettier: single quotes, no semicolons, 120 char print width, no trailing commas, JSX single quotes
- ESLint: Next.js core web vitals + TypeScript rules, integrated with Prettier
- shadcn/ui "new-york" style, Lucide icons, Tailwind CSS v4 with CSS variables
- Path alias `@/` maps to the project root

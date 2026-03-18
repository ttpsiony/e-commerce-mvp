This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

這是一個基本的 no session 狀態的電商 MVP 專案，主要有首頁、商品頁、商品詳細頁、購物車、購物頁，進行了專案規劃，策略選擇，以及流程 E2E 基本測試

This is a basic e-commerce MVP project without session state. It includes a homepage, product listing page, product detail page, shopping cart, and checkout page, along with project planning, strategy selection, and basic end-to-end flow testing.


## Architecture Overview

- **app/api/**：api 路徑
- **app/\*/page.tsx**：路由的 SSR/ISR or Metadata 處理
- **components/**：模組、UI 和共用元件
- **shared/**：features 共用的函數
- **lib/**：infra 共用的函數
- **cypress/**：E2E 測試
- **public/**：公開的資源


## Architecture Rules

- **app/api/\*/route.ts**：給 client 呼叫，隱藏 後端 server 路由，或 server 使用
- **app/\*/page.tsx**：頁面路由，用來處理 metadata、SSR、ISR 渲染策略，以及處理 SEO
- **components/common/**：各 features 共用的元件 (跨模組)
- **components/ui/**：各功能模組/頁面所使用的最小可用元件 (跨模組)
- **components/features**：
  - **/component.tsx**：功能模組內使用的元件，純 UI 顯示
  - **/utils.ts**：模組內的業務、資料等邏輯處理在此
  - **/api.ts**：模組內功能相關的 api
- **shared**：跨 features 共用的函數
- **lib/**：infra 中，可通用、共用的函數
- **cypress/**：E2E 測試檔案，優先測試重要流程的成功與失敗路徑
- **public/**：公開的資源（**.json, **.txt, favicon, image ...)


## Tech Stack

1. Next.js + tailwind css + shadcn
2. zustand
3. react-hook-form
4. axios/next fetch
5. cypress


## Trade-offs

1. zustand：因為主要是 no session 的購物車，需要使用 localStorage 保持資料，zustand 在 localStorage persist 有好的 utils
2. pagination：在 products 頁面，因為是 MVP 專案(沒有 server)，使用 cursor-based pagination，如果要更好的 SEO 與使用體驗，可以改成 offset-based


## Rendering strategy

1. **首頁 SSR**，透過 api route 何必 request，以及部分 below-the-fold lazy loading。輪播首圖 prefetch，透過點擊上下一步箭頭，再去載入需要的圖片。
2. **商品列表頁 SSR**，load more 的方式載入商品，使用 skeleton。然後首張圖片 fetchPriority='high' (LCP問題)。移動到商品卡片時，預載商品詳細頁的資話。
3. **商品詳細頁 ISR**，資料變動較少，產生快取頁面，透過 revalidate 可更新快取。必要時，商品價格與庫存，可以在CSR做更新。
4. **購物車、Checkout CSR等**，不需要被索引，表單元件、localStorage 在 client 載入。


## Performance & SEO

透過 lighthouse 查看影響的原因 (實驗數據)，之後可以透過 monitor 觀察使用者數據

1. dev 透過 lighthouse 和 network 排查可能存在的問題
2. 透過 local build 檢查是否修正
3. 使用 SKILLS 檢查，修正遺漏的問題
4. useMemo、useCallback、React.memo，正確的使用
5. 降低 API 請求數量
6. 降低 js bundle size


## Future Evolution

1. i18n
2. offset-based pagination
3. session order process
4. image optimization：CDN、webp、responsive image
5. client cache：SWR for cache、optimistic update
6. logger/monitor：Sentry


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

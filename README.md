# shop-helper

A mobile store-management app for shop owners — track products, stock, prices, and sales from your phone. Built with **Expo (React Native) + TypeScript**, using `expo-router` for navigation and `expo-sqlite` for a durable, offline-first local database.

## Features

- **Dashboard** — today's sales total, total inventory value, and low-stock alerts
- **Products** — add, edit, and delete products (name, category, price, stock, low-stock threshold)
- **Stock** — adjust quantities in/out (never below zero), with low-stock badges
- **Sales** — record multi-line sales; stock decrements automatically and the sale is kept in a dated, expandable log

## Stack

- Expo SDK 57 + React Native + TypeScript (strict)
- expo-router (file-based navigation)
- expo-sqlite (WAL mode, foreign keys enforced; seeded with sample products on first launch)

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (same Wi-Fi). If the phone can't connect, run `npx expo start --tunnel` instead.

## Data & storage

All data lives in a local SQLite database (`shop-helper.db`) — no server required. Important notes:

- Deleting a product that has sales history is blocked (keeps sales records intact).
- Overselling is blocked: a sale with more items than are in stock is rejected as one atomic transaction, so nothing is partially written.
- The currency symbol shown in the app is defined once in `src/lib/format.ts` (`CURRENCY_SYMBOL`) — change it there if you use a different currency.

## Project layout

```
src/app/            expo-router screens (dashboard, products, sales)
src/components/     forms, badges, cards
src/lib/            SQLite access layer + formatting helpers
src/types/          shared TypeScript types
```
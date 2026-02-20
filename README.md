# Degustazione di Vino

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-5-7b3f00?style=for-the-badge)

Фронтенд-каталог вин на `Next.js App Router` з авторизацією, оцінками, коментарями та списком улюблених.

</div>

## Про проєкт

`Degustazione di Vino` допомагає шукати вина, переглядати деталі, ставити оцінки, писати коментарі та формувати персональні добірки.

Основний стек: `Next.js`, `React`, `TypeScript`, `Tailwind`, `Zustand`, `Axios`.

## Функціонал

- Каталог вин з фільтрами, сортуванням і пагінацією.
- Перегляд детальної сторінки вина (`/cards/[id]`).
- Оцінки користувачів (крок `0.5`) і агрегований рейтинг.
- Коментарі з оптимістичним оновленням.
- Список улюблених вин користувача.
- Авторизація та збереження сесії в `localStorage`.
- Профіль користувача зі статистикою.
- Створення нової картки вина.
- Hybrid cache в `localStorage` (TTL + stale-while-revalidate підхід).
- Централізована обробка API-помилок з дружніми повідомленнями для користувача (`getApiErrorMessage`).
- Стабільна генерація `sitemap.xml` з таймаутом запиту до API та fallback при недоступності бекенду.
- Глобальні сторінки помилок App Router: `error.tsx` (runtime error) та `not-found.tsx` (404).
- Світла/темна теми (на головній сторінці дизайн зафіксований у світлій стилістиці).

## Маршрути

- `/` - лендінг
- `/login` - вхід та реєстрація
- `/cards` - каталог вин
- `/cards/[id]` - деталі конкретної картки
- `/favorites` - улюблені вина
- `/add-card` - створення нової картки
- `/profile` - профіль користувача

## Структура проєкту

```text
src/
├── app/                  # App Router сторінки
│   ├── add-card/
│   ├── cards/
│   ├── error.tsx
│   ├── favorites/
│   ├── login/
│   ├── not-found.tsx
│   └── profile/
├── components/           # UI-компоненти
├── contexts/             # ThemeContext
├── lib/                  # кеш, optimistic updates, hooks
├── services/             # API-клієнт
├── store/                # Zustand store
└── types/                # TypeScript типи
```

## Швидкий старт

1. Встановіть залежності:

```bash
npm install
```

2. Створіть `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Якщо змінну не вказати, використовується fallback API URL з `src/services/api.ts`.

3. Запустіть dev-сервер:

```bash
npm run dev
```

Відкрийте `http://localhost:3000`.

## Скрипти

- `npm run dev` - запуск у dev-режимі
- `npm run build` - production build
- `npm run start` - запуск production build
- `npm run lint` - ESLint перевірка

## Лінт-конфіг

- Проєкт використовує `ESLint 9` з flat config у файлі `eslint.config.mjs`.
- Файл `.eslintrc.json` залишено для сумісності, але основним є `eslint.config.mjs`.

## API

Базовий URL задається через `NEXT_PUBLIC_API_URL`.

Очікувані групи ендпоінтів:
- `auth`
- `cards`
- `favorites`

Корисні посилання:
- Swagger: `https://wine-server-b5gr.onrender.com/docs/`
- Backend repo: `https://github.com/bunbanto/vine-server`

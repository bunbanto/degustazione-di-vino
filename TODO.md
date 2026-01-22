# TODO - Реалізація коментарів

## Backend

- [x] 1. Оновити модель Card (`../vine-server/src/models/card.js`)
  - [x] Додати масив comments до схеми

- [x] 2. Оновити контролер cards (`../vine-server/src/controllers/cards.js`)
  - [x] Додати ендпоінт POST /cards/:id/comments - додати коментар
  - [x] Додати ендпоінт GET /cards/:id/comments - отримати коментарі з пагінацією
  - [x] Додати ендпоінт DELETE /cards/:id/comments/:commentId - видалити коментар

- [x] 3. Оновити роути (`../vine-server/src/routes/api/cards.js`)
  - [x] Додати роути для коментарів

## Frontend

- [x] 4. Оновити типи (`src/types/index.ts`)
  - [x] Додати інтерфейс Comment
  - [x] Додати поле comments до WineCard

- [x] 5. Оновити API сервіс (`src/services/api.ts`)
  - [x] Додати функцію getComments(cardId, page, limit)
  - [x] Додати функцію addComment(cardId, text)
  - [x] Додати функцію deleteComment(cardId, commentId)

- [x] 6. Створити компонент CommentsSection (`src/components/CommentsSection.tsx`)
  - [x] Відображення списку коментарів
  - [x] Форма додавання коментаря
  - [x] Логіка пагінації
  - [x] Кнопка видалення коментаря

- [x] 7. Інтегрувати компонент (`src/components/WineCardModal.tsx`)
  - [x] Додати секцію коментарів до модального вікна

## Запуск

- [ ] Перезапустити сервер: `cd ../vine-server && npm start`
- [ ] Перезапустити Next.js: `npm run dev`

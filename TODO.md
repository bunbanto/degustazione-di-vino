# Rating System Improvements

## Task

1. Rating step 0.5 - Already implemented (10 stars with left/right halves)
2. Visually show stars after server submission with confirmation

## Changes Made

### WineCard.tsx

- [x] Add `pendingRating` state to track rating during server request
- [x] Modify `handleRate` to set `pendingRating` before API call
- [x] Update `useEffect` to not overwrite from server when pending rating exists
- [x] Keep stars visible during loading with `pendingRating`
- [x] Show "Ваш:" rating during loading state
- [x] After successful submission, show "✓ збережено" confirmation
- [x] Reset success message after 2 seconds
- [x] On error, clear `pendingRating` to reload from server

### CardsContent.tsx

- [x] Update `handleRate` to return `Promise<void>` for proper async tracking

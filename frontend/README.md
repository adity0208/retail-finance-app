Retail POS - Local-first PWA (Brutalist)

Quick start

1. Frontend only (local-first):
   - cd frontend
   - npm install
   - npm run dev
   - Open the app in a mobile browser or desktop at http://localhost:3000

Notes
- The app uses IndexedDB via the idb library to store data locally:
  - Object stores: electronics, clothing, expenses, transactions
  - Images are stored as base64 data URLs in the photoData fields (client-side storage)
- PWA: manifest.json and a basic service worker are included in public/. Place icons in public/icons/ (icon-192.png, icon-512.png)

Key features implemented
- Local IndexedDB storage engine with helper API at src/lib/db.js
- Add Item modal captures images, converts them to Base64, and saves to IndexedDB
- POS Cart works offline and enforces selling-price >= cost-price guardrail
- Low-stock alerting for clothing categories with a dashboard
- Brutalist design system: #F5F5F0 canvas, #1A1A1A text, 1px #C0C0C0 borders, square corners

Next steps
- Add icons in public/icons
- (Optional) Add client-side image compression before saving to reduce DB usage
- (Optional) Implement data export/import for backups

# POS PWA Skeleton

This project provides a minimal Progressive Web App for a point of sale system. It demonstrates core pieces required for a fully featured POS:

- Real-time inventory with FIFO cost batches.
- Basic sales screen with automatic stock reduction and PromptPay QR generation.
- Simple sales report between dates.
- Debts tracking for unpaid transactions.
- Offline capability via service worker.

The app uses Google Sheets through Google Apps Script (not included) for persistence. Replace the placeholders in `scripts/app.js` with calls to your backend script and configure your PromptPay ID.

## Development

Open `index.html` in a browser or deploy the project to any static hosting service. Install as a PWA to use on mobile devices.

This repository contains only static files and no automated tests.

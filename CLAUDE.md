# CLAUDE.md

## Project Overview

A single-page stock ticker lookup website. Users enter a stock ticker symbol (e.g. AAPL, MSFT) and receive real-time financial data including price, key statistics, and company details.

## Tech Stack

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (ES6+, async/await)
- [Alpha Vantage API](https://www.alphavantage.co/) for stock data

## Project Structure

```
/
  index.html     - Main HTML page with search form and result sections
  styles.css     - All styling (dark theme, responsive, animations)
  app.js         - API calls, DOM manipulation, data formatting
  CLAUDE.md      - This file
```

## Development

### Setup

No build step required. Open `index.html` in a browser or serve with any static file server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

### Build

No build step. Pure static files.

### Test

Open in browser and search for known tickers (AAPL, MSFT, GOOGL, AMZN).

### Lint / Format

No linter configured. Standard JS style is used throughout.

## Architecture

- **Single-page app** with no framework or build tools
- **Two parallel API calls** per search: `GLOBAL_QUOTE` (price data) and `OVERVIEW` (company fundamentals)
- **CSS custom properties** for theming (dark mode by default)
- **Responsive design** with mobile breakpoint at 600px
- All formatting helpers (`formatCurrency`, `formatLargeNumber`, etc.) are pure functions in `app.js`

## Important Notes

- The app ships with the Alpha Vantage `demo` API key which is severely rate-limited (5 calls/min, 25/day). Replace `API_KEY` in `app.js` with a free key from https://www.alphavantage.co/support/#api-key for regular use.
- All API calls are client-side; no secrets are hidden from the browser.
- The `demo` key only returns data for a limited set of tickers (IBM works reliably with the demo key).

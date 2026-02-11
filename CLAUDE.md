# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Two standalone stock research tools served as static files (no build step):

1. **Stock Ticker Lookup** (`index.html` + `styles.css` + `app.js`) — simple ticker search using Alpha Vantage API
2. **Meridian** (`meridian.html`) — full equity research terminal with charts, financials, SWOT analysis, and news

## Running Locally

```bash
# Any static file server works:
python -m http.server 8000
npx serve .
```

No build, lint, or test tooling is configured.

## Architecture

### Stock Ticker Lookup (index.html)
- Vanilla JS, no framework
- Uses Alpha Vantage `GLOBAL_QUOTE` and `OVERVIEW` endpoints in parallel via `Promise.all`
- Ships with the `demo` API key (severely rate-limited: 5 calls/min, 25/day; only IBM works reliably). Replace `API_KEY` in `app.js` for real use.
- All state is managed via DOM class toggling (`hidden` class)

### Meridian (meridian.html)
- Single-file React app loaded via CDN (`react@18`, `react-dom@18`, `@babel/standalone` for JSX transpilation, `recharts` for charts)
- All code (CSS + JSX) lives in the one HTML file
- **Data sources**: Yahoo Finance via `allorigins.win` CORS proxy for quotes, summaries, and price history
- **AI-generated content**: Calls the Anthropic Claude API directly from the browser for SWOT analysis and news curation (requires API key in `callClaude` function, currently empty)
- State machine: `hero` → `loading` (step-by-step progress) → `dashboard` | `error`
- Key components: `App` (state machine + data orchestration), `KPICard`, `MiniBarCard`, `SWOTGrid`, `NewsList`, `ValuationTable`, `CustomTooltip`
- Helper functions: `safeVal` (deep property access with `.raw` unwrapping for Yahoo API), `fmtNum`/`fmtPct`/`fmtCurrency`/`fmtDate`/`qLabel` (formatting)
- `computeQuarterly()` derives profitability ratios, liquidity metrics, and FCF from raw Yahoo financial statements

## Key Details

- Both apps are entirely client-side; API keys are exposed in the browser
- The Meridian `callClaude` function has an empty `x-api-key` header — it needs a valid Anthropic API key to enable SWOT and news features. Without it, hardcoded fallback data is used.
- Yahoo Finance data is accessed through a CORS proxy (`allorigins.win`), which may be unreliable
- CSS uses custom properties throughout — Ticker Lookup has a dark theme, Meridian has a cream/editorial theme with grain texture overlay

// Alpha Vantage free API key (demo key - replace with your own for higher limits)
const API_KEY = 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// DOM Elements
const searchForm = document.getElementById('search-form');
const tickerInput = document.getElementById('ticker-input');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('stock-results');

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker) {
        fetchStockData(ticker);
    }
});

// Fetch all stock data
async function fetchStockData(ticker) {
    showLoading();
    hideError();
    hideResults();

    try {
        // Fetch quote and overview in parallel
        const [quoteData, overviewData] = await Promise.all([
            fetchQuote(ticker),
            fetchOverview(ticker),
        ]);

        if (!quoteData || Object.keys(quoteData).length === 0) {
            throw new Error(`No data found for ticker "${ticker}". Please check the symbol and try again.`);
        }

        renderResults(ticker, quoteData, overviewData);
        showResults();
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

// Fetch real-time quote
async function fetchQuote(ticker) {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data['Note']) {
        throw new Error('API rate limit reached. The free tier allows 25 requests/day. Please try again later or use your own API key.');
    }

    if (data['Error Message']) {
        throw new Error(`Invalid ticker symbol "${ticker}".`);
    }

    return data['Global Quote'] || {};
}

// Fetch company overview
async function fetchOverview(ticker) {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data['Note']) {
        // Rate limited - return empty, we'll still show quote data
        return {};
    }

    return data || {};
}

// Render all results
function renderResults(ticker, quote, overview) {
    // Company Header
    const companyName = overview['Name'] || ticker;
    document.getElementById('company-name').textContent = companyName;
    document.getElementById('ticker-badge').textContent = ticker;
    document.getElementById('exchange-badge').textContent = overview['Exchange'] || '';

    // Price
    const price = parseFloat(quote['05. price']) || 0;
    const change = parseFloat(quote['09. change']) || 0;
    const changePercent = quote['10. change percent'] || '0%';

    document.getElementById('current-price').textContent = formatCurrency(price);

    const changeEl = document.getElementById('price-change');
    const sign = change >= 0 ? '+' : '';
    changeEl.textContent = `${sign}${change.toFixed(2)} (${changePercent})`;
    changeEl.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;

    // Key Stats
    setText('stat-open', formatCurrency(quote['02. open']));
    setText('stat-prev-close', formatCurrency(quote['08. previous close']));
    setText('stat-high', formatCurrency(quote['03. high']));
    setText('stat-low', formatCurrency(quote['04. low']));
    setText('stat-52high', formatCurrency(overview['52WeekHigh']));
    setText('stat-52low', formatCurrency(overview['52WeekLow']));
    setText('stat-volume', formatNumber(quote['06. volume']));
    setText('stat-avg-volume', formatNumber(overview['SharesOutstanding'] ? undefined : undefined));

    // Try to show average volume from overview if available
    // Alpha Vantage doesn't have avg volume directly, use the latest volume as reference
    const avgVol = overview['200DayMovingAverage'] ? '--' : '--';
    // We don't have avg volume from this API, show what we can
    setText('stat-avg-volume', formatNumber(quote['06. volume']));

    // Company Details
    setText('detail-market-cap', formatLargeNumber(overview['MarketCapitalization']));
    setText('detail-pe', formatDecimal(overview['PERatio']));
    setText('detail-eps', formatCurrency(overview['EPS']));
    setText('detail-dividend', overview['DividendYield']
        ? (parseFloat(overview['DividendYield']) * 100).toFixed(2) + '%'
        : '--');
    setText('detail-beta', formatDecimal(overview['Beta']));
    setText('detail-sector', overview['Sector'] || '--');
    setText('detail-industry', overview['Industry'] || '--');
    setText('detail-country', overview['Country'] || '--');

    // Description
    const descEl = document.getElementById('company-description');
    descEl.textContent = overview['Description'] || 'No description available for this company.';
}

// Helper Functions
function setText(id, value) {
    document.getElementById(id).textContent = value || '--';
}

function formatCurrency(value) {
    if (!value || value === 'None') return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value) {
    if (!value || value === 'None') return '--';
    const num = parseInt(value);
    if (isNaN(num)) return '--';
    return num.toLocaleString('en-US');
}

function formatDecimal(value) {
    if (!value || value === 'None' || value === '0') return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    return num.toFixed(2);
}

function formatLargeNumber(value) {
    if (!value || value === 'None') return '--';
    const num = parseFloat(value);
    if (isNaN(num)) return '--';

    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString('en-US');
}

// UI State Helpers
function showLoading() {
    loadingEl.classList.remove('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}

function showResults() {
    resultsEl.classList.remove('hidden');
}

function hideResults() {
    resultsEl.classList.add('hidden');
}

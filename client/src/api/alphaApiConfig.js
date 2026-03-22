const FINNHUB_API_KEY = 'd6vtth9r01qiiutd4a2gd6vtth9r01qiiutd4a30';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export const STOCKS_PAGE_SIZE = 4;
export const STOCKS_AUTO_REFRESH_MS = 60_000;
export const NEWS_PAGE_SIZE = 6;
export const INSIDER_PAGE_SIZE = 8;

export const STOCKS_SYMBOLS = [
	{ symbol: 'AAPL', name: 'Apple Inc.' },
	{ symbol: 'MSFT', name: 'Microsoft Corp.' },
	{ symbol: 'NVDA', name: 'NVIDIA Corp.' },
	{ symbol: 'AMZN', name: 'Amazon.com Inc.' },
	{ symbol: 'GOOGL', name: 'Alphabet Inc.' },
	{ symbol: 'META', name: 'Meta Platforms Inc.' },
	{ symbol: 'TSLA', name: 'Tesla Inc.' },
	{ symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
	{ symbol: 'BAC', name: 'Bank of America Corp.' },
	{ symbol: 'NFLX', name: 'Netflix Inc.' },
	{ symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
	{ symbol: 'INTC', name: 'Intel Corp.' },
];

const formatNumber = (value, maxFractionDigits = 2) => {
	if (value == null || Number.isNaN(value)) return 'N/A';
	return new Intl.NumberFormat('en-US', {
		maximumFractionDigits: maxFractionDigits,
	}).format(value);
};

const getPagedSymbols = (page = 1, pageSize = STOCKS_PAGE_SIZE) => {
	const start = (page - 1) * pageSize;
	return STOCKS_SYMBOLS.slice(start, start + pageSize);
};

const fetchStockQuote = async (symbolMeta) => {
	const params = new URLSearchParams({
		symbol: symbolMeta.symbol,
		token: FINNHUB_API_KEY,
	});

	const response = await fetch(`${FINNHUB_BASE_URL}/quote?${params}`);
	if (!response.ok) {
		throw new Error(`Finnhub request failed (${response.status})`);
	}

	const data = await response.json();

	// Finnhub returns numeric fields: c=current, d=change, dp=change%, h=high, l=low, o=open, pc=prev close, t=unix time.
	if (typeof data.c !== 'number') {
		throw new Error('Invalid quote response from Finnhub');
	}

	return {
		symbol: symbolMeta.symbol,
		name: symbolMeta.name,
		price: data.c,
		high: data.h,
		low: data.l,
		open: data.o,
		previousClose: data.pc,
		change: data.d,
		changePercent: data.dp,
		lastUpdated: data.t ? new Date(data.t * 1000).toLocaleString() : 'N/A',
		currency: 'USD',
		formattedPrice: `$${formatNumber(data.c, 2)}`,
		formattedHigh: `$${formatNumber(data.h, 2)}`,
		formattedLow: `$${formatNumber(data.l, 2)}`,
		formattedOpen: `$${formatNumber(data.o, 2)}`,
		formattedPrevClose: `$${formatNumber(data.pc, 2)}`,
	};
};

export const fetchStocksData = async (page = 1, pageSize = STOCKS_PAGE_SIZE) => {
	const symbolsForPage = getPagedSymbols(page, pageSize);

	const results = await Promise.all(
		symbolsForPage.map(async (symbolMeta) => {
			try {
				return await fetchStockQuote(symbolMeta);
			} catch (error) {
				return {
					symbol: symbolMeta.symbol,
					name: symbolMeta.name,
					price: null,
					high: null,
					low: null,
					open: null,
					previousClose: null,
					change: null,
					changePercent: null,
					lastUpdated: null,
					currency: 'USD',
					formattedPrice: 'N/A',
					formattedHigh: 'N/A',
					formattedLow: 'N/A',
					formattedOpen: 'N/A',
					formattedPrevClose: 'N/A',
					error: error.message,
				};
			}
		}),
	);

	return {
		instruments: results,
		totalResults: STOCKS_SYMBOLS.length,
	};
};

export const fetchMarketNews = async (category = 'stocks') => {
	const params = new URLSearchParams({
		category,
		token: FINNHUB_API_KEY,
	});

	const response = await fetch(`${FINNHUB_BASE_URL}/news?${params}`);
	if (!response.ok) {
		throw new Error(`Finnhub market news request failed (${response.status})`);
	}

	const data = await response.json();
	if (!Array.isArray(data)) {
		throw new Error('Invalid market news response from Finnhub');
	}

	return data;
};

export const fetchInsiderTransactions = async (symbol = 'AAPL') => {
	const to = new Date();
	const from = new Date();
	from.setDate(from.getDate() - 180);

	const params = new URLSearchParams({
		symbol,
		from: from.toISOString().split('T')[0],
		to: to.toISOString().split('T')[0],
		token: FINNHUB_API_KEY,
	});

	const response = await fetch(`${FINNHUB_BASE_URL}/stock/insider-transactions?${params}`);
	if (!response.ok) {
		throw new Error(`Finnhub insider request failed (${response.status})`);
	}

	const payload = await response.json();
	const transactions = Array.isArray(payload?.data) ? payload.data : [];

	return transactions;
};

const NEWS_API_KEY = '6ac17f6c739641c8982f0d78f87eee8a';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

export const PAGE_SIZE = 9;

// Maps CategoryRail labels to NewsAPI search queries
const CATEGORY_QUERIES = {
  All:           'Headlines',
  Politics:      'politics',
  Weather:       'weather',
  Technology:    'tech',
  Sports:        'sports',
  Crypto:        'cryptocurrency OR bitcoin OR crypto',
  Stocks:        'stocks OR "stock market" OR NYSE',
  'Real Estate': '"real estate" OR housing OR mortgage',
  AI:            '"artificial intelligence" OR "machine learning"',
  Energy:        'energy OR oil OR renewable',
  Health:        'health OR medicine OR healthcare',
};

/**
 * Fetch news articles from NewsAPI.
 * @param {string} category - One of the CategoryRail labels (e.g. "All", "Crypto")
 * @param {number} page     - 1-based page number
 * @returns {Promise<{ articles: object[], totalResults: number }>}
 */
export const fetchNews = async (category = 'All', page = 1) => {
  const query = CATEGORY_QUERIES[category] ?? CATEGORY_QUERIES.All;

  // Keep within the free-tier historical window with a small buffer for UTC cutoffs.
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 28);
  const fromDate = from.toISOString().split('T')[0];
  const toDate = to.toISOString().split('T')[0];

  const params = new URLSearchParams({
    q:        query,
    from:     fromDate,
    to:       toDate,
    sortBy:   'popularity',
    pageSize: PAGE_SIZE,
    page:     page,
    apiKey:   NEWS_API_KEY,
  });

  const response = await fetch(`${NEWS_API_BASE_URL}?${params}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message ?? `NewsAPI error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'ok') {
    throw new Error(data.message ?? 'Unknown NewsAPI error');
  }

  return {
    articles:     data.articles,
    totalResults: data.totalResults,
  };
};

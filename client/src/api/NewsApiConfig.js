const CURRENTS_API_KEY = 'otc2CQfYlaEFnL7nagfd9d3gQpIZBnzbDSgosKv28GiHGBs9';
const CURRENTS_BASE_URL = 'https://api.currentsapi.services/v1/search';

export const PAGE_SIZE = 9;

// Maps CategoryRail labels to Currents search parameters.
const CATEGORY_CONFIG = {
  All: { category: 'world', keywords: '' },
  Politics: { category: 'politics', keywords: 'politics' },
  Weather: { category: 'regional', keywords: 'weather' },
  Technology: { category: 'technology', keywords: 'technology' },
  Sports: { category: 'sports', keywords: 'sports' },
  Entertainment: { category: 'entertainment', keywords: 'entertainment' },
  Stocks: { category: 'finance', keywords: 'stocks' },
  'Real Estate': { category: 'estate', keywords: 'estate' },
  AI: { category: 'technology', keywords: 'AI' },
  Energy: { category: 'energy', keywords: 'energy' },
  Health: { category: 'health', keywords: 'health' },
};

const normalizeArticle = (item) => ({
  urlToImage: item.image || item.urlToImage || null,
  title: item.title || 'Untitled article',
  description: item.description || item.content || 'No description available.',
  author: item.author || item.source || 'Unknown',
  publishedAt: item.published || item.publishedAt || new Date().toISOString(),
  url: item.url || item.link || '#',
});

const fetchCurrentsPage = async ({ category, keywords, page }) => {
  const params = new URLSearchParams({
    apiKey: CURRENTS_API_KEY,
    language: 'en',
    type: '1',
    country: 'INT',
    page_number: String(page),
    page_size: String(PAGE_SIZE),
  });

  if (category) {
    params.set('category', category);
  }

  if (keywords) {
    params.set('keywords', keywords);
  }

  const response = await fetch(`${CURRENTS_BASE_URL}?${params}`, {
    headers: {
      Authorization: CURRENTS_API_KEY,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Currents API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status && data.status !== 'ok' && data.status !== 'success') {
    throw new Error(data.message || 'Unknown Currents API error');
  }

  return data;
};

/**
 * Fetch news articles from Currents API.
 * @param {string} category - One of the CategoryRail labels (e.g. "All", "Crypto")
 * @param {number} page     - 1-based page number
 * @returns {Promise<{ articles: object[], totalResults: number, hasMore: boolean }>}
 */
export const fetchNews = async (category = 'All', page = 1) => {
  const requestedPage = Math.max(1, page);
  const { category: apiCategory, keywords } = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.All;
  const data = await fetchCurrentsPage({
    category: apiCategory,
    keywords,
    page: requestedPage,
  });

  const rawArticles = Array.isArray(data?.news)
    ? data.news
    : Array.isArray(data?.results)
      ? data.results
      : [];
  const normalized = rawArticles.map(normalizeArticle);

  const totalFromApi = Number.isFinite(data?.totalResults)
    ? data.totalResults
    : Number.isFinite(data?.total)
      ? data.total
      : Number.isFinite(data?.total_hits)
        ? data.total_hits
        : 0;

  const hasMore = normalized.length === PAGE_SIZE;
  const fallbackTotal = hasMore
    ? requestedPage * PAGE_SIZE + 1
    : (requestedPage - 1) * PAGE_SIZE + normalized.length;

  return {
    articles: normalized,
    totalResults: totalFromApi || fallbackTotal,
    hasMore,
  };
};

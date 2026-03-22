const NEWSDATA_API_KEY = 'pub_0909b81040694a5384e6c068353fc9f2';
const NEWSDATA_BASE_URL = 'https://newsdata.io/api/1/latest';

export const PAGE_SIZE = 9;

// Maps CategoryRail labels to NewsData.io query terms.
const CATEGORY_TERMS = {
  All: 'headlines',
  Politics: 'politics',
  Weather: 'weather',
  Technology: 'technology',
  Sports: 'sports',
  Crypto: 'crypto OR bitcoin OR ethereum',
  Stocks: 'stocks OR market OR nyse OR nasdaq',
  'Real Estate': 'real estate OR housing OR mortgage',
  AI: 'artificial intelligence OR machine learning',
  Energy: 'energy OR oil OR renewable',
  Health: 'health OR medicine OR healthcare',
};

const normalizeArticle = (item) => ({
  urlToImage: item.image_url || null,
  title: item.title || 'Untitled article',
  description: item.description || item.content || 'No description available.',
  author: Array.isArray(item.creator)
    ? item.creator.filter(Boolean).join(', ') || item.source_name || 'Unknown'
    : item.source_name || 'Unknown',
  publishedAt: item.pubDate || new Date().toISOString(),
  url: item.link || '#',
});

const fetchNewsDataPage = async ({ query, pageToken }) => {
  const params = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    language: 'en',
    q: query,
  });

  if (pageToken) {
    params.set('page', pageToken);
  }

  const response = await fetch(`${NEWSDATA_BASE_URL}?${params}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.results?.message || err.message || `NewsData error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'success') {
    throw new Error(data.results?.message || data.message || 'Unknown NewsData error');
  }

  return data;
};

/**
 * Fetch news articles from NewsData.io.
 * @param {string} category - One of the CategoryRail labels (e.g. "All", "Crypto")
 * @param {number} page     - 1-based page number
 * @returns {Promise<{ articles: object[], totalResults: number }>}
 */
export const fetchNews = async (category = 'All', page = 1) => {
  const query = CATEGORY_TERMS[category] ?? CATEGORY_TERMS.All;

  // NewsData uses token-based pagination; this bridges it to page numbers used by the UI.
  const requestedPage = Math.max(1, page);
  let pageToken = null;
  let current = 1;
  let data = null;

  while (current <= requestedPage) {
    data = await fetchNewsDataPage({ query, pageToken });
    if (current === requestedPage) break;

    if (!data.nextPage) {
      return {
        articles: [],
        totalResults: (requestedPage - 1) * PAGE_SIZE,
      };
    }

    pageToken = data.nextPage;
    current += 1;
  }

  const normalized = (data?.results || []).map(normalizeArticle);
  const totalFromApi = Number.isFinite(data?.totalResults) ? data.totalResults : 0;

  return {
    articles: normalized,
    totalResults: totalFromApi || normalized.length,
  };
};

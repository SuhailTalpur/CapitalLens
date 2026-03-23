import React, { useState, useEffect, useCallback } from 'react';
import { ClipLoader } from 'react-spinners';
import CategoryRail from './categoryRail';
import ArticleCard from './articleCard';
import { fetchNews, PAGE_SIZE } from '../api/NewsApiConfig';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));

  const loadNews = useCallback(async (category, pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const { articles: data, totalResults: total, hasMore: canLoadMore } = await fetchNews(category, pageNum);
      setArticles(data);
      setTotalResults(total);
      setHasMore(Boolean(canLoadMore));
    } catch (err) {
      setError(err.message);
      setArticles([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(activeCategory, page);
  }, [activeCategory, page, loadNews]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <CategoryRail activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <ClipLoader color="#a855f7" size={48} />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => loadNews(activeCategory, page)}
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white hover:text-black transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-gray-500 text-sm">No articles found for this category.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-8 justify-center mt-8">
              {articles.map((article, index) => (
                <ArticleCard
                  key={`${article.url}-${index}`}
                  image={article.urlToImage}
                  title={article.title}
                  description={article.description}
                  author={article.author}
                  date={new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  url={article.url}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {(totalPages > 1 || page > 1 || hasMore) && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all ${
                        item === page
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages && !hasMore}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Minus,
  Newspaper,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import ArticleCard from './articleCard';
import {
  fetchInsiderTransactions,
  fetchMarketNews,
  fetchStocksData,
  INSIDER_PAGE_SIZE,
  NEWS_PAGE_SIZE,
  STOCKS_AUTO_REFRESH_MS,
  STOCKS_PAGE_SIZE,
  STOCKS_SYMBOLS,
} from '../api/alphaApiConfig';

const rails = [
  { label: 'Stocks', icon: BarChart3 },
  { label: 'Market News', icon: Newspaper },
  { label: 'Insider Transactions', icon: FileText },
];

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
      >
        <ChevronLeft size={16} />
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, idx) => idx + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
          acc.push(p);
          return acc;
        }, [])
        .map((item, idx) =>
          item === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500 text-sm">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all ${
                item === page
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          ),
        )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const StocksPanel = React.memo(({ cards }) => {
  if (cards.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-75">
        <p className="text-gray-500 text-sm">No stock quotes available.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {cards.map((item) => {
        const isNegative = (item.change ?? 0) < 0;
        const isPositive = (item.change ?? 0) > 0;

        return (
          <article
            key={item.symbol}
            className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{item.symbol}</p>
                <h3 className="text-lg font-semibold text-white mt-1">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Last update: {item.lastUpdated ?? 'N/A'}</p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-2xl font-semibold text-white">{item.formattedPrice}</p>
                <div
                  className={`text-sm mt-1 inline-flex items-center gap-1 ${
                    isNegative
                      ? 'text-red-400'
                      : isPositive
                        ? 'text-emerald-400'
                        : 'text-gray-400'
                  }`}
                >
                  {isNegative && <TrendingDown size={14} />}
                  {isPositive && <TrendingUp size={14} />}
                  {!isNegative && !isPositive && <Minus size={14} />}
                  {item.change == null || item.changePercent == null
                    ? 'Change unavailable'
                    : `${isPositive ? '+' : ''}${item.change.toFixed(2)} (${isPositive ? '+' : ''}${item.changePercent.toFixed(2)}%)`}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border border-purple-500/40 bg-black/20 px-3 py-2">
                <p className="text-sm text-gray-300 inline-flex items-center gap-1">
                  <TrendingUp size={14} /> High
                </p>
                <p className="text-gray-200 font-medium mt-1">{item.formattedHigh}</p>
              </div>
              <div className="rounded-xl border border-purple-500/40 bg-black/20 px-3 py-2">
                <p className="text-sm text-gray-300 inline-flex items-center gap-1">
                  <TrendingDown size={14} /> Low
                </p>
                <p className="text-gray-200 font-medium mt-1">{item.formattedLow}</p>
              </div>
              <div className="rounded-xl border border-purple-500/40 bg-black/20 px-3 py-2">
                <p className="text-sm text-gray-300 inline-flex items-center gap-1">
                  <Clock3 size={14} /> Open
                </p>
                <p className="text-gray-200 font-medium mt-1">{item.formattedOpen}</p>
              </div>
              <div className="rounded-xl border border-purple-500/40 bg-black/20 px-3 py-2">
                <p className="text-sm text-gray-300 inline-flex items-center gap-1">
                  <BarChart3 size={14} /> Prev Close
                </p>
                <p className="text-gray-200 font-medium mt-1">{item.formattedPrevClose}</p>
              </div>
            </div>

            {item.error && <p className="text-xs text-amber-400 mt-3">{item.error}</p>}
          </article>
        );
      })}
    </div>
  );
});

const MarketNewsPanel = React.memo(({ news }) => {
  if (news.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-75">
        <p className="text-gray-500 text-sm">No market news available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-8 justify-center mt-8">
      {news.map((article) => (
        <ArticleCard
          key={article.id}
          image={article.image}
          title={article.headline}
          description={article.summary}
          author={article.source}
          date={new Date(article.datetime * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          url={article.url}
        />
      ))}
    </div>
  );
});

const InsiderTransactionsPanel = React.memo(({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-75">
        <p className="text-gray-500 text-sm">No insider transactions found.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {transactions.map((item, idx) => {
        const codeColor =
          item.transactionCode === 'S'
            ? 'text-red-400'
            : item.transactionCode === 'P' || item.transactionCode === 'M'
              ? 'text-emerald-400'
              : 'text-gray-300';

        return (
          <article
            key={`${item.name}-${item.transactionDate}-${idx}`}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-white font-medium inline-flex items-center gap-1">
                  <UserRound size={14} className="text-gray-400" />
                  {item.name ?? 'Unknown Insider'}
                </p>
                <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                  <CalendarDays size={12} className="text-gray-500" />
                  Transaction: {item.transactionDate ?? 'N/A'} • Filing: {item.filingDate ?? 'N/A'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className={`text-sm font-semibold ${codeColor}`}>
                  Code {item.transactionCode ?? 'N/A'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Price: {item.transactionPrice == null ? 'N/A' : `$${Number(item.transactionPrice).toFixed(2)}`}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-gray-500">Shares Held</p>
                <p className="text-gray-200 mt-1">{item.share ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                  {Number(item.change) < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  Change
                </p>
                <p className={`${Number(item.change) < 0 ? 'text-red-400' : 'text-emerald-400'} mt-1`}>
                  {item.change ?? 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-gray-500">Symbol</p>
                <p className="text-gray-200 mt-1">AAPL</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
});

const Stocks = () => {
  const [activeRail, setActiveRail] = useState('Stocks');

  const [stockCards, setStockCards] = useState([]);
  const [stocksPage, setStocksPage] = useState(1);

  const [newsItems, setNewsItems] = useState([]);
  const [newsPage, setNewsPage] = useState(1);

  const [insiderItems, setInsiderItems] = useState([]);
  const [insiderPage, setInsiderPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadStocks = useCallback(async (pageNum, isAutoRefresh = false) => {
      if (isAutoRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      try {
        const { instruments } = await fetchStocksData(pageNum, STOCKS_PAGE_SIZE);
        setStockCards(instruments);
      } catch (err) {
        setError(err.message || 'Unable to fetch market data');
        setStockCards([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
  }, []);

  const loadMarketNews = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      const data = await fetchMarketNews('general');
      setNewsItems(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch market news');
      setNewsItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadInsiderTransactions = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      const data = await fetchInsiderTransactions('AAPL');
      setInsiderItems(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch insider transactions');
      setInsiderItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeRail === 'Stocks') loadStocks(stocksPage);
    if (activeRail === 'Market News') loadMarketNews();
    if (activeRail === 'Insider Transactions') loadInsiderTransactions();
  }, [activeRail, stocksPage, loadStocks, loadMarketNews, loadInsiderTransactions]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeRail === 'Stocks') loadStocks(stocksPage, true);
      if (activeRail === 'Market News') loadMarketNews(true);
      if (activeRail === 'Insider Transactions') loadInsiderTransactions(true);
    }, STOCKS_AUTO_REFRESH_MS);

    return () => clearInterval(timer);
  }, [activeRail, stocksPage, loadStocks, loadMarketNews, loadInsiderTransactions]);

  const paginatedNews = useMemo(() => {
    const start = (newsPage - 1) * NEWS_PAGE_SIZE;
    return newsItems.slice(start, start + NEWS_PAGE_SIZE);
  }, [newsItems, newsPage]);

  const paginatedInsider = useMemo(() => {
    const start = (insiderPage - 1) * INSIDER_PAGE_SIZE;
    return insiderItems.slice(start, start + INSIDER_PAGE_SIZE);
  }, [insiderItems, insiderPage]);

  const stocksTotalPages = Math.max(1, Math.ceil(STOCKS_SYMBOLS.length / STOCKS_PAGE_SIZE));
  const newsTotalPages = Math.max(1, Math.ceil(newsItems.length / NEWS_PAGE_SIZE));
  const insiderTotalPages = Math.max(1, Math.ceil(insiderItems.length / INSIDER_PAGE_SIZE));

  const onRailChange = (nextRail) => {
    setActiveRail(nextRail);
    setError(null);
    if (nextRail === 'Stocks') setStocksPage(1);
    if (nextRail === 'Market News') setNewsPage(1);
    if (nextRail === 'Insider Transactions') setInsiderPage(1);
  };

  const onPageChange = (nextPage) => {
    if (activeRail === 'Stocks') setStocksPage(nextPage);
    if (activeRail === 'Market News') setNewsPage(nextPage);
    if (activeRail === 'Insider Transactions') setInsiderPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage =
    activeRail === 'Stocks' ? stocksPage : activeRail === 'Market News' ? newsPage : insiderPage;
  const currentTotalPages =
    activeRail === 'Stocks'
      ? stocksTotalPages
      : activeRail === 'Market News'
        ? newsTotalPages
        : insiderTotalPages;

  const refreshCurrentRail = () => {
    if (activeRail === 'Stocks') loadStocks(stocksPage, true);
    if (activeRail === 'Market News') loadMarketNews(true);
    if (activeRail === 'Insider Transactions') loadInsiderTransactions(true);
  };

  const retryCurrentRail = () => {
    if (activeRail === 'Stocks') loadStocks(stocksPage);
    if (activeRail === 'Market News') loadMarketNews();
    if (activeRail === 'Insider Transactions') loadInsiderTransactions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="w-full border-b border-white/5 bg-transparent">
        <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth">
          {rails.map((rail) => {
            const RailIcon = rail.icon;

            return (
            <button
              key={rail.label}
              onClick={() => onRailChange(rail.label)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border inline-flex items-center gap-2
                transition-all duration-200
                ${
                  rail.label === activeRail
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <RailIcon size={14} />
              {rail.label}
            </button>
          );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
        <p className="inline-flex items-center gap-2">
        </p>
        <button
          onClick={refreshCurrentRail}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh now'}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-75">
          <ClipLoader color="#a855f7" size={42} />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center min-h-75 gap-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={retryCurrentRail}
            className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white hover:text-black transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeRail === 'Stocks' && <StocksPanel cards={stockCards} />}
          {activeRail === 'Market News' && <MarketNewsPanel news={paginatedNews} />}
          {activeRail === 'Insider Transactions' && (
            <InsiderTransactionsPanel transactions={paginatedInsider} />
          )}

          <Pagination page={currentPage} totalPages={currentTotalPages} onPageChange={onPageChange} />
        </>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </div>
  );
};

export default Stocks;
import { useState, useEffect } from 'react';
import { fetchArticles } from '../api';
import ArticleCard from './ArticleCard';

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await fetchArticles();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load articles. Please make sure the API server is running.');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'enhanced') return article.is_enhanced;
    if (filter === 'original') return !article.is_enhanced;
    return true;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadArticles} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="article-list-container">
      <div className="article-list-header">
        <h1>Articles</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({articles.length})
          </button>
          <button
            className={`filter-btn ${filter === 'enhanced' ? 'active' : ''}`}
            onClick={() => setFilter('enhanced')}
          >
            Enhanced ({articles.filter(a => a.is_enhanced).length})
          </button>
          <button
            className={`filter-btn ${filter === 'original' ? 'active' : ''}`}
            onClick={() => setFilter('original')}
          >
            Original ({articles.filter(a => !a.is_enhanced).length})
          </button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="no-articles">
          <p>No articles found.</p>
        </div>
      ) : (
        <div className="article-grid">
          {filteredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticleList;

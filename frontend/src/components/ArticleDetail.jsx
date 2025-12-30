import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle } from '../api';

function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('original');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await fetchArticle(id);
      setArticle(data);
      setError(null);
    } catch (err) {
      setError('Failed to load article.');
      console.error('Error loading article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="error-message">
        <h2>Error</h2>
        <p>{error || 'Article not found'}</p>
        <Link to="/" className="back-link">Back to Articles</Link>
      </div>
    );
  }

  return (
    <div className="article-detail">
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Articles
      </Link>

      {article.featured_image && (
        <div className="article-hero">
          <img src={article.featured_image} alt={article.title} />
        </div>
      )}

      <div className="article-header">
        <h1>{article.title}</h1>
        <div className="article-meta">
          {article.author && <span className="author">By {article.author}</span>}
          {article.published_date && (
            <span className="date">{formatDate(article.published_date)}</span>
          )}
          {article.is_enhanced && (
            <span className="enhanced-tag">Enhanced Version Available</span>
          )}
        </div>
      </div>

      {article.is_enhanced && (
        <div className="content-tabs">
          <button
            className={`tab-btn ${activeTab === 'original' ? 'active' : ''}`}
            onClick={() => setActiveTab('original')}
          >
            Original Content
          </button>
          <button
            className={`tab-btn ${activeTab === 'enhanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('enhanced')}
          >
            Enhanced Content
          </button>
        </div>
      )}

      <div className="article-content">
        {activeTab === 'original' ? (
          <div
            className="content-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <>
            <div
              className="content-body"
              dangerouslySetInnerHTML={{ __html: article.enhanced_content }}
            />
            {(article.reference_1_url || article.reference_2_url) && (
              <div className="references">
                <h3>References</h3>
                <ul>
                  {article.reference_1_url && (
                    <li>
                      <a href={article.reference_1_url} target="_blank" rel="noopener noreferrer">
                        {article.reference_1_title || article.reference_1_url}
                      </a>
                    </li>
                  )}
                  {article.reference_2_url && (
                    <li>
                      <a href={article.reference_2_url} target="_blank" rel="noopener noreferrer">
                        {article.reference_2_title || article.reference_2_url}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {article.source_url && (
        <div className="source-link">
          <p>
            Original source:{' '}
            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
              {article.source_url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default ArticleDetail;

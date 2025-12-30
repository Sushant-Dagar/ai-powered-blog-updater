import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="article-card">
      {article.featured_image && (
        <div className="article-card-image">
          <img src={article.featured_image} alt={article.title} />
          {article.is_enhanced && (
            <span className="enhanced-badge">Enhanced</span>
          )}
        </div>
      )}
      <div className="article-card-content">
        <div className="article-card-meta">
          {article.author && <span className="author">{article.author}</span>}
          {article.published_date && (
            <span className="date">{formatDate(article.published_date)}</span>
          )}
        </div>
        <h2 className="article-card-title">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h2>
        {article.excerpt && (
          <p className="article-card-excerpt">{article.excerpt}</p>
        )}
        <Link to={`/article/${article.id}`} className="read-more">
          Read More
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </article>
  );
}

export default ArticleCard;

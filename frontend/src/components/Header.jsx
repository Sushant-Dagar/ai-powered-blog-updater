import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-icon">B</span>
          <span className="logo-text">BeyondChats Articles</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">All Articles</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<ArticleList />} />
              <Route path="/article/:id" element={<ArticleDetail />} />
            </Routes>
          </div>
        </main>
        <footer className="footer">
          <div className="container">
            <p>BeyondChats Article Platform - Built with React & Laravel</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

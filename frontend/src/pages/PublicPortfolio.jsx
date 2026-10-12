import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicPortfolio } from '../api/portfolio';
import { loadSettings } from '../data/themes';
import PortfolioView from '../components/portfolio/PortfolioView';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState('');
  const [settings] = useState(() => loadSettings());

  useEffect(() => {
    fetchPublicPortfolio(slug)
      .then(setPortfolio)
      .catch((err) => setError(err.response?.data?.message || 'Hindi mahanap ang portfolio.'));
  }, [slug]);

  if (error) return <p className="center error">{error}</p>;
  if (!portfolio) return <p className="center">Loading portfolio...</p>;

  return (
    <div className="container wide">
      <PortfolioView portfolio={portfolio} settings={settings} />
    </div>
  );
}

import { LegalFooter } from './LegalPages';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type Article = {
  id: number; title: string; slug: string; summary: string | null; body?: string;
  cover_image_url: string | null; cover_image_alt: string | null;
  published_at: string; author_name?: string | null;
};
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function renderMarkdown(source: string) {
  let html = escapeHtml(source || '');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((https:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^(?:- .+(?:\n|$))+?/gm, block =>
    '<ul>' + block.trim().split('\n').map(line => '<li>' + line.replace(/^- /, '') + '</li>').join('') + '</ul>');
  html = html.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-3]|ul|blockquote)/.test(trimmed)) return trimmed;
    return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  return { __html: html };
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));
}

export default function PublicArticlesPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const path = slug ? `/public/articles/${encodeURIComponent(slug)}` : '/public/articles';
    fetch(API + path)
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Chargement impossible.');
        return data;
      })
      .then(data => {
        if (!active) return;
        if (slug) setArticle(data.article);
        else setArticles(data.articles || []);
      })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Une erreur est survenue.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return (
    <>
    <main className="public-news-page">
      <header className="public-news-header">
        <Link to="/" className="public-back">← Retour au portail FOCOM ILIAD</Link>
        <p className="eyebrow">FORCE OUVRIÈRE · GROUPE ILIAD</p>
        <h1>{slug ? 'Actualité' : <>Les actualités<span>.</span></>}</h1>
        {!slug && <p>Informations, communiqués et publications des équipes FO du groupe ILIAD.</p>}
      </header>
      {loading ? <p className="public-news-state">Chargement des publications…</p> :
        error ? <p className="public-news-state public-news-error">{error}</p> :
        slug ? (
          article ? <article className="public-article">
            <Link to="/actualites" className="public-back">← Toutes les actualités</Link>
            <p className="public-article-date">{article.published_at ? formatDate(article.published_at) : ''}{article.author_name ? ` · ${article.author_name}` : ''}</p>
            <h1>{article.title}</h1>
            {article.summary && <p className="public-article-summary">{article.summary}</p>}
            {article.cover_image_url && <img className="public-article-cover" src={article.cover_image_url} alt={article.cover_image_alt || ''} />}
            <div className="public-article-body" dangerouslySetInnerHTML={renderMarkdown(article.body || '')} />
          </article> : <p className="public-news-state">Cette publication n’existe pas ou n’est pas accessible.</p>
        ) : (
          articles.length ? <div className="public-article-grid">{articles.map(item => (
            <article className="public-article-card" key={item.id}>
              {item.cover_image_url && <Link to={`/actualites/${item.slug}`}><img src={item.cover_image_url} alt={item.cover_image_alt || ''} loading="lazy" /></Link>}
              <div className="public-article-card-content">
                <span>{item.published_at ? formatDate(item.published_at) : 'FOCOM ILIAD'}</span>
                <h2><Link to={`/actualites/${item.slug}`}>{item.title}</Link></h2>
                {item.summary && <p>{item.summary}</p>}
                <Link className="public-read-more" to={`/actualites/${item.slug}`}>Lire l’article ↗</Link>
              </div>
            </article>
          ))}</div> : <div className="public-news-empty"><span>FO</span><h2>Aucune actualité publiée pour le moment</h2><p>Les prochaines publications FO du groupe ILIAD apparaîtront ici.</p><Link to="/">Retour à l’accueil</Link></div>
        )
      }
    </main>
    <LegalFooter />
    </>
  );
}

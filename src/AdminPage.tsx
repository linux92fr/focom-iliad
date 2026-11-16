import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authClient, getNeonAccessToken } from './auth-client';

type Article = {
  id: number; title: string; slug: string; summary: string; body: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at?: string | null; updated_at?: string; author_name?: string | null;
};
type Stats = { articles: number; published: number; drafts: number; entities: number; profiles: number };

const emptyArticle = { title: '', slug: '', summary: '', body: '', status: 'draft' as Article['status'] };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyArticle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getNeonAccessToken();
    if (!token) throw new Error('Votre session ne fournit pas de jeton. Reconnectez-vous.');
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    if (!base) throw new Error('API non configurée.');
    const response = await fetch(base + path, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
    return data;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [dashboard, listing] = await Promise.all([
        api('/admin/dashboard'), api('/admin/articles'),
      ]);
      setStats(dashboard.stats);
      setArticles(listing.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { refresh(); }, [refresh]);

  function startNew() {
    setSelected(null); setForm(emptyArticle); setNotice(''); setError('');
  }
  function startEdit(article: Article) {
    setSelected(article);
    setForm({ title: article.title, slug: article.slug, summary: article.summary || '', body: article.body || '', status: article.status });
    setNotice(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result = await api(selected ? `/admin/articles/${selected.id}` : '/admin/articles', {
        method: selected ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      setNotice(selected ? 'Article mis à jour.' : 'Brouillon créé.');
      setSelected(result.article);
      setForm({ title: result.article.title, slug: result.article.slug, summary: result.article.summary || '', body: result.article.body || '', status: result.article.status });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally { setSaving(false); }
  }

  async function signOut() { await authClient?.signOut(); }

  return (
    <main className="admin-page">
      <div className="admin-top">
        <div><p className="eyebrow">FOCOM ILIAD · ADMINISTRATION</p><h1>Tableau de bord</h1><p>Gérez les publications et les contenus du portail.</p></div>
        <div className="admin-top-actions"><Link className="admin-secondary" to="/">Voir le portail ↗</Link><button className="admin-secondary" onClick={signOut}>Déconnexion</button></div>
      </div>

      {error && <p className="admin-alert" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <section className="admin-stats" aria-label="Indicateurs">
        {[
          ['Articles', stats?.articles], ['Publiés', stats?.published], ['Brouillons', stats?.drafts],
          ['Entités actives', stats?.entities], ['Comptes actifs', stats?.profiles],
        ].map(([label, value]) => <article className="admin-stat" key={label as string}><span>{label}</span><strong>{loading ? '—' : value}</strong></article>)}
      </section>

      <section className="admin-content">
        <div className="admin-section-head"><div><p className="eyebrow">CONTENUS ÉDITORIAUX</p><h2>{selected ? 'Modifier un article' : 'Publications'}</h2></div><button className="admin-primary" onClick={startNew}>+ Nouvel article</button></div>
        <div className="admin-columns">
          <div className="admin-list">
            <h3>Articles récents</h3>
            {loading ? <p>Chargement des articles…</p> : articles.length === 0 ? <p>Aucun article pour le moment.</p> : articles.map(article => (
              <button className={selected?.id === article.id ? 'admin-article active' : 'admin-article'} key={article.id} onClick={() => startEdit(article)}>
                <span><strong>{article.title}</strong><small>{article.author_name || 'Auteur'} · {article.slug}</small></span>
                <em className={`status-${article.status}`}>{({ draft: 'Brouillon', review: 'À relire', published: 'Publié', archived: 'Archivé' })[article.status]}</em>
              </button>
            ))}
          </div>
          <form className="admin-editor" onSubmit={save}>
            <h3>{selected ? `Article #${selected.id}` : 'Créer un brouillon'}</h3>
            <label>Titre<input required maxLength={180} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label>Slug (adresse de l’article)<input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="genere-depuis-le-titre" /></label>
            <label>Résumé<textarea rows={2} maxLength={500} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></label>
            <label>Contenu<textarea rows={10} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></label>
            {selected && <label>État<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Article['status'] })}><option value="draft">Brouillon</option><option value="review">À relire</option><option value="published">Publié</option><option value="archived">Archivé</option></select></label>}
            <div className="admin-form-actions"><button className="admin-primary" disabled={saving}>{saving ? 'Enregistrement…' : selected ? 'Enregistrer les modifications' : 'Créer le brouillon'}</button>{selected && <button type="button" className="admin-secondary" onClick={startNew}>Annuler</button>}</div>
            <p className="admin-hint">Les nouveaux articles sont créés en brouillon. La publication est réservée à un administrateur.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

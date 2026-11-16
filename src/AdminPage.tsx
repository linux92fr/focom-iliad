import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authClient, getNeonAccessToken } from './auth-client';

type Article = {
  id: number; title: string; slug: string; summary: string; body: string; cover_image_url?: string | null; cover_image_alt?: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at?: string | null; updated_at?: string; author_name?: string | null; entity_ids?: number[]; category_ids?: number[];
};
type Stats = { articles: number; published: number; drafts: number; entities: number; profiles: number };
type Entity = { id: number; name: string; slug: string; entity_type: string; lifecycle_status: 'active' | 'absorbed' | 'pending_confirmation'; effective_from: string | null; effective_to: string | null; absorbed_into_id: number | null; confirmation_note: string | null };\ntype Category = { id: number; name: string; slug: string };

const emptyArticle = { title: '', slug: '', summary: '', body: '', cover_image_url: '', cover_image_alt: '', status: 'draft' as Article['status'], entity_ids: [] as number[], category_ids: [] as number[] };

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Small, dependency-free Markdown preview. Source text is escaped before formatting.
function markdownPreview(markdown: string) {
  let html = escapeHtml(markdown || 'Votre aperçu apparaîtra ici.');
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

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyArticle);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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
      const [dashboard, listing, registry] = await Promise.all([api('/admin/dashboard'), api('/admin/articles'), api('/admin/editorial-options')]);
      setStats(dashboard.stats);
      setArticles(listing.articles);
      setEntities(registry.entities || []);
      setCategories(registry.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally { setLoading(false); }
  }, [api]);

  useEffect(() => { refresh(); }, [refresh]);

  function startNew() {
    setSelected(null); setForm(emptyArticle); setNotice(''); setError(''); setPreview(false);
  }
  function startEdit(article: Article) {
    setSelected(article);
    setForm({ title: article.title, slug: article.slug, summary: article.summary || '', body: article.body || '', cover_image_url: article.cover_image_url || '', cover_image_alt: article.cover_image_alt || '', status: article.status, entity_ids: article.entity_ids || [], category_ids: article.category_ids || [] });
    setNotice(''); setError(''); setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function insertMarkdown(before: string, after = before, placeholder = 'texte') {
    const area = bodyRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selectedText = form.body.slice(start, end) || placeholder;
    const next = form.body.slice(0, start) + before + selectedText + after + form.body.slice(end);
    setForm({ ...form, body: next });
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result = await api(selected ? `/admin/articles/${selected.id}` : '/admin/articles', {
        method: selected ? 'PUT' : 'POST', body: JSON.stringify(form),
      });
      setNotice(selected ? 'Article mis à jour.' : 'Brouillon créé.');
      setSelected(result.article);
      setForm({ title: result.article.title, slug: result.article.slug, summary: result.article.summary || '', body: result.article.body || '', cover_image_url: result.article.cover_image_url || '', cover_image_alt: result.article.cover_image_alt || '', status: result.article.status, entity_ids: result.article.entity_ids || form.entity_ids, category_ids: result.article.category_ids || form.category_ids });
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
      <section className="admin-content admin-entity-registry">
        <div className="admin-section-head"><div><p className="eyebrow">STRUCTURE DU GROUPE</p><h2>Référentiel des entités</h2></div><span className="admin-registry-count">{entities.length} entités</span></div>
        <p className="admin-hint">Historique conservé pour rattacher les publications aux bonnes structures. Les dates et statuts de réorganisation sont ceux saisis dans le référentiel.</p>
        <div className="admin-entity-list">
          {entities.map(entity => <article className="admin-entity-row" key={entity.id}>
            <div><strong>{entity.name}</strong><small>{entity.entity_type === 'company' ? 'Société' : entity.entity_type === 'subsidiary' ? 'Filiale' : entity.entity_type === 'ues' ? 'UES' : entity.entity_type === 'establishment' ? 'Établissement' : 'Autre'} · {entity.slug}</small></div>
            <span className={`admin-entity-status entity-${entity.lifecycle_status}`}>{entity.lifecycle_status === 'active' ? 'Active' : entity.lifecycle_status === 'absorbed' ? 'Absorbée' : 'À confirmer'}</span>
            <small>{entity.effective_from ? `À partir du ${new Intl.DateTimeFormat('fr-FR').format(new Date(entity.effective_from))}` : entity.effective_to ? `Jusqu’au ${new Intl.DateTimeFormat('fr-FR').format(new Date(entity.effective_to))}` : entity.confirmation_note || '—'}</small>
          </article>)}
          {!entities.length && <p>Aucune entité enregistrée.</p>}
        </div>
      </section>
      <section className="admin-content">
        <div className="admin-section-head"><div><p className="eyebrow">CONTENUS ÉDITORIAUX</p><h2>{selected ? 'Modifier un article' : 'Publications'}</h2></div><button className="admin-primary" type="button" onClick={startNew}>+ Nouvel article</button></div>
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
            <div className="admin-taxonomy-grid">
              <fieldset className="admin-taxonomy"><legend>Entités concernées</legend>
                {entities.map(entity => <label className="admin-check-option" key={entity.id}><input type="checkbox" checked={form.entity_ids.includes(entity.id)} onChange={e => setForm({ ...form, entity_ids: e.target.checked ? [...form.entity_ids, entity.id] : form.entity_ids.filter(id => id !== entity.id) })} /><span>{entity.name}{entity.lifecycle_status === 'absorbed' ? ' (absorbée)' : entity.lifecycle_status === 'pending_confirmation' ? ' (à confirmer)' : ''}</span></label>)}
                {!entities.length && <small>Aucune entité disponible.</small>}
              </fieldset>
              <fieldset className="admin-taxonomy"><legend>Catégories</legend>
                {categories.map(category => <label className="admin-check-option" key={category.id}><input type="checkbox" checked={form.category_ids.includes(category.id)} onChange={e => setForm({ ...form, category_ids: e.target.checked ? [...form.category_ids, category.id] : form.category_ids.filter(id => id !== category.id) })} /><span>{category.name}</span></label>)}
                {!categories.length && <small>Aucune catégorie créée pour le moment.</small>}
              </fieldset>
            </div>
            <div className="admin-cover-fields"><label>Image de couverture (URL HTTPS)<input type="url" placeholder="https://…" value={form.cover_image_url} onChange={e => setForm({ ...form, cover_image_url: e.target.value })} /></label><label>Texte alternatif de l’image<input maxLength={250} placeholder="Description de l’image" value={form.cover_image_alt} onChange={e => setForm({ ...form, cover_image_alt: e.target.value })} /></label>{form.cover_image_url && <img className="admin-cover-preview" src={form.cover_image_url} alt={form.cover_image_alt || 'Aperçu de la couverture'} />}</div>
            <div className="admin-editor-toolbar">
              <span>MISE EN FORME</span>
              <button type="button" onClick={() => insertMarkdown('**', '**', 'texte en gras')} title="Gras"><strong>G</strong></button>
              <button type="button" onClick={() => insertMarkdown('*', '*', 'texte en italique')} title="Italique"><em>I</em></button>
              <button type="button" onClick={() => insertMarkdown('## ', '', 'Titre de section')} title="Titre de section">H2</button>
              <button type="button" onClick={() => insertMarkdown('- ', '', 'Élément de liste')} title="Liste">• Liste</button>
              <button type="button" onClick={() => insertMarkdown('[', '](https://)', 'texte du lien')} title="Lien">Lien</button>
              <button type="button" onClick={() => insertMarkdown('![', '](https://adresse-image)', 'description image')} title="Insérer une image">Image</button>
              <button type="button" onClick={() => insertMarkdown('> ', '', 'Citation')} title="Citation">Citation</button>
              <button type="button" className={preview ? 'preview-active' : ''} onClick={() => setPreview(!preview)}>{preview ? 'Éditer' : 'Prévisualiser'}</button>
            </div>
            {preview ? (
              <div className="admin-preview-wrap">
                <div className="admin-preview-meta"><span>APERÇU DE PUBLICATION</span><strong>{form.title || 'Titre de l’article'}</strong>{form.summary && <p>{form.summary}</p>}{form.cover_image_url && <img className="admin-preview-cover" src={form.cover_image_url} alt={form.cover_image_alt || ''} />}</div>
                <div className="admin-markdown-preview" dangerouslySetInnerHTML={markdownPreview(form.body)} />
              </div>
            ) : (
              <label className="admin-body-label">Contenu
                <textarea ref={bodyRef} rows={14} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Rédigez votre article. Utilisez la barre d’outils pour mettre en forme le texte." />
                <small>Format texte enrichi Markdown : les titres, le gras, l’italique, les listes, les citations et les liens sont disponibles.</small>
              </label>
            )}
            {selected && <label>État<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Article['status'] })}><option value="draft">Brouillon</option><option value="review">À relire</option><option value="published">Publié</option><option value="archived">Archivé</option></select></label>}
            <div className="admin-form-actions"><button className="admin-primary" disabled={saving}>{saving ? 'Enregistrement…' : selected ? 'Enregistrer les modifications' : 'Créer le brouillon'}</button>{selected && <button type="button" className="admin-secondary" onClick={startNew}>Annuler</button>}</div>
            <p className="admin-hint">Les nouveaux articles sont créés en brouillon. La publication est réservée à un administrateur.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

import { LegalFooter } from './LegalPages';
import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react'

const navItems = [
  ['Le groupe', '#groupe'],
  ['Actualités', '/actualites'],
  ['Vos droits', '#droits'],
  ['Nos actions', '#agir'],
  ['Vos représentants', '#representants'],
]
const entities = [
  { title: 'Télécommunications', text: 'Les métiers, les équipes et les réalités des activités télécoms du groupe.' },
  { title: 'Services et solutions', text: 'Les activités de services, les fonctions support et les équipes qui les font vivre.' },
  { title: 'Cloud et infrastructures', text: 'Les métiers techniques, les infrastructures et les expertises numériques.' },
  { title: 'Périmètres et établissements', text: 'Des informations à retrouver selon votre société et votre établissement.' },
]
const rights = [
  ['Contrat de travail', 'Repères sur le contrat, la période d’essai, la rémunération et les évolutions professionnelles.'],
  ['Temps de travail', 'Durées, horaires, repos, congés et dispositifs applicables selon votre situation.'],
  ['Rémunération', 'Salaire, primes, participation, intéressement et éléments de rémunération.'],
  ['Santé et conditions de travail', 'Prévention, sécurité, charge de travail et accompagnement des situations difficiles.'],
  ['Représentation collective', 'CSE, droits syndicaux, accords collectifs et moyens d’expression des salariés.'],
  ['Égalité et respect', 'Égalité professionnelle, lutte contre les discriminations et prévention du harcèlement.'],
]
const actions = [
  ['Faire remonter les réalités du terrain', 'Partager les difficultés rencontrées dans votre équipe ou votre établissement.'],
  ['Porter des revendications communes', 'Construire des revendications à partir des attentes exprimées par les salariés.'],
  ['Se mobiliser collectivement', 'Retrouver les campagnes, pétitions, consultations et appels à mobilisation.'],
]
type HomepageArticle = { id: number; title: string; slug: string; summary: string | null; cover_image_url: string | null; cover_image_alt: string | null; published_at: string };
const API = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [latestArticles, setLatestArticles] = useState<HomepageArticle[]>([])
  useEffect(() => {
    let active = true
    fetch(API + '/public/articles')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Chargement impossible')))
      .then(data => { if (active) setLatestArticles((data.articles || []).slice(0, 3)) })
      .catch(() => { if (active) setLatestArticles([]) })
    return () => { active = false }
  }, [])
  const closeMenu = () => setMenuOpen(false)
  return (
    <div className="site-shell">
      <div className="topline"><span>FORCE OUVRIÈRE</span><span>PORTAIL SYNDICAL DU GROUPE ILIAD</span></div>
      <header className="header">
        <a className="brand" href="#accueil" aria-label="Accueil FOCOM ILIAD"><img src="/focom-logo.jpg" alt="Logo officiel FOCOM" /><span className="brand-name">ILIAD<small>PORTAIL SYNDICAL DU GROUPE</small></span></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Ouvrir le menu">☰</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
          <a href="#adherer" onClick={closeMenu}>Adhérer</a>
          <a href="/auth/sign-in" onClick={closeMenu}>Connexion</a>
          <a className="contact-link" href="/auth/sign-up" onClick={closeMenu}>Créer un compte <span>↗</span></a>
        </nav>
      </header>
      <main>
        <section className="hero" id="accueil">
          <div className="hero-copy">
            <p className="eyebrow"><span /> FORCE OUVRIÈRE · GROUPE ILIAD</p>
            <h1>La voix des salariés.<br /><em>La force du collectif.</em></h1>
            <p className="hero-intro">Un portail pour s’informer, comprendre ses droits et faire entendre les revendications des salariés du groupe ILIAD.</p>
            <div className="hero-actions"><a className="button button-red" href="#actualites">Découvrir les actualités <span>→</span></a><a className="text-link" href="#representants">Trouver vos représentants</a></div>
          </div>
          <div className="hero-panel"><div className="panel-top"><span>FOCOM · ILIAD</span><span>ENSEMBLE</span></div><img className="hero-logo" src="/focom-logo.jpg" alt="FOCOM, Force Ouvrière Communication" /><div className="panel-caption">INFORMER<br />DÉFENDRE<br />AGIR</div><div className="panel-bottom"><span>UN PORTAIL · DES ÉQUIPES · UNE MÊME FORCE</span><b>01 / 06</b></div></div>
          <div className="hero-index">01 <span>—</span> LE PORTAIL FO</div>
        </section>
        <section className="quick-strip" aria-label="Accès rapides">
          <a href="#actualites"><span className="quick-icon">▤</span><span><b>Actualités</b><small>Les informations du groupe</small></span><strong>↗</strong></a>
          <a href="#droits"><span className="quick-icon">§</span><span><b>Vos droits</b><small>Comprendre et connaître</small></span><strong>↗</strong></a>
          <a href="#agir"><span className="quick-icon">✳</span><span><b>Nos revendications</b><small>Nos priorités et nos actions</small></span><strong>↗</strong></a>
          <a href="#contact"><span className="quick-icon">✉</span><span><b>Nous contacter</b><small>Échanger avec FO</small></span><strong>↗</strong></a>
        </section>
        <section className="section intro-section" id="groupe">
          <div className="section-heading"><div><p className="eyebrow">UN GROUPE, DES RÉALITÉS</p><h2>Une représentation<br /><em>au plus près du terrain.</em></h2></div><p className="section-lead">Le groupe ILIAD rassemble des activités, des métiers et des équipes aux réalités diverses. FO souhaite rendre l’information syndicale plus accessible et faciliter les échanges entre les salariés et leurs représentants.</p></div>
          <div className="topic-grid">{entities.map((item, i) => <article className="topic-card" key={item.title}><span className="topic-number">0{i + 1}</span><span className="topic-icon">{['◎', '◇', '⌘', '▦'][i]}</span><h3>{item.title}</h3><p>{item.text}</p><a className="card-arrow" href="#representants">En savoir plus <b>↗</b></a></article>)}</div>
          <div className="section-callout"><div><span className="news-label">UNE SECTION DU PORTAIL</span><h3>FOCOM UES ILIAD</h3><p>Retrouvez l’espace dédié à la représentation FO de l’UES ILIAD. Ce site conserve son fonctionnement et son adresse propres.</p></div><a className="button button-red" href="https://focomues-iliad.fr/" target="_blank" rel="noreferrer">Accéder à FOCOM UES ILIAD <span>↗</span></a></div>
          <div className="section-callout section-callout-locked">
            <div>
              <span className="news-label">UNE SECTION DU PORTAIL</span>
              <h3>FO FREE DISTRIBUTION</h3>
              <p>Une section dédiée à la distribution de documents et d’informations pour les salariés du groupe. L’accès est restreint et l’ouverture est prévue prochainement.</p>
            </div>
            <span className="locked-badge"><Lock size={14} /> Accès restreint · Ouverture prochaine</span>
          </div>
        </section>
        <section className="news-section" id="actualites"><div className="section news-inner"><div className="news-heading"><div><p className="eyebrow">RESTER INFORMÉ</p><h2>À la une<span>.</span></h2></div><a className="coming-tag news-all-link" href="/actualites">TOUTES LES ACTUALITÉS ↗</a></div>{latestArticles.length ? <div className="home-news-grid">{latestArticles.map(item => <article className="home-news-card" key={item.id}>{item.cover_image_url && <a href={`/actualites/${item.slug}`}><img src={item.cover_image_url} alt={item.cover_image_alt || ''} loading="lazy" /></a>}<div className="home-news-card-content"><span className="news-label">{item.published_at ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(item.published_at)) : 'FOCOM ILIAD'}</span><h3><a href={`/actualites/${item.slug}`}>{item.title}</a></h3>{item.summary && <p>{item.summary}</p>}<a className="public-read-more" href={`/actualites/${item.slug}`}>Lire l’article ↗</a></div></article>)}</div> : <div className="news-placeholder"><div className="news-placeholder-mark">FO</div><div><span className="news-label">ACTUALITÉS FOCOM</span><h3>Les actualités FO du groupe ILIAD</h3><p>Les dernières publications apparaîtront ici dès leur mise en ligne.</p></div><a className="button button-red" href="/actualites">Consulter les actualités <span>↗</span></a><span className="news-arrow">↗</span></div>}</div></section>
        <section className="section entities-section" id="droits"><div className="section-heading compact"><div><p className="eyebrow">S’INFORMER ET SE DÉFENDRE</p><h2>Vos droits.<br /><em>Vos repères.</em></h2></div><p className="section-lead">Des ressources pour mieux comprendre vos droits au travail. Les règles pouvant varier selon la société, l’établissement et les accords applicables, rapprochez-vous de vos représentants pour une réponse adaptée à votre situation.</p></div><div className="rights-grid">{rights.map((item, i) => <article className="right-card" key={item[0]}><span>0{i + 1} / REPÈRES PRATIQUES</span><h3>{item[0]}</h3><p>{item[1]}</p><a href="#contact">Poser une question <b>↗</b></a></article>)}</div></section>
        <section className="action-section" id="agir"><div className="section"><div className="section-heading"><div><p className="eyebrow">REVENDIQUER ET AGIR</p><h2>Nos droits avancent<br /><em>par l’action collective.</em></h2></div><p className="section-lead">Les revendications FO partent du quotidien des salariés. Informer, consulter, construire des propositions et agir ensemble : chaque voix compte.</p></div><div className="action-grid">{actions.map((item, i) => <article className="action-card" key={item[0]}><span className="action-number">0{i + 1}</span><h3>{item[0]}</h3><p>{item[1]}</p><a href="#contact">Échanger avec FO <b>↗</b></a></article>)}</div></div></section>
        <section className="section reps-section" id="representants"><div className="section-heading"><div><p className="eyebrow">À VOS CÔTÉS</p><h2>Vos représentants<br /><em>FO sur le terrain.</em></h2></div><p className="section-lead">Les interlocuteurs et les périmètres de représentation seront organisés par société et établissement. Pour préserver la confidentialité, les coordonnées personnelles ne seront pas publiées sans accord.</p></div><div className="rep-panel"><div className="rep-mark">FO</div><div><span className="news-label">BESOIN D’UN CONTACT ?</span><h3>Vous souhaitez joindre un représentant FO ?</h3><p>Précisez votre société, votre établissement et l’objet de votre demande. Nous pourrons vous orienter vers le bon interlocuteur.</p></div><a className="button button-red" href="#contact">Nous contacter <span>↗</span></a></div></section>
        <section className="join-band" id="adherer"><div><p className="eyebrow">REJOINDRE FORCE OUVRIÈRE</p><h2>Ne restez pas seul.<br /><em>Faisons entendre votre voix.</em></h2><p>Adhérer, c’est participer à une action collective et renforcer la défense des droits des salariés.</p></div><a className="button button-light" href="#contact">Demander des informations <span>↗</span></a></section>
        <section className="contact-section" id="contact"><div className="section contact-inner"><div><p className="eyebrow">RESTONS EN CONTACT</p><h2>Une question, une situation,<br /><em>une envie d’agir ?</em></h2></div><div className="contact-copy"><p>Écrivez-nous en indiquant votre société et votre établissement. Un contact téléphonique pourra être nécessaire pour comprendre votre demande et convenir d’un échange.</p><p className="contact-note">Les coordonnées et le formulaire sécurisé seront ajoutés lors de la mise en place de l’espace de contact.</p></div></div></section>
      </main>
      <LegalFooter />
    </div>
  )
}
export default App

import { LegalFooter } from './LegalPages';
import { ChevronDown, Lock, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

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

const portalStats = [
  {
    value: '04',
    label: 'Univers du groupe',
    title: 'Des réalités diverses, une représentation commune',
    text: 'Télécommunications, services et solutions, cloud et infrastructures, ainsi que les périmètres et établissements du groupe.',
  },
  {
    value: '06',
    label: 'Repères pratiques',
    title: 'Vos droits expliqués',
    text: 'Des fiches synthétiques sur le contrat de travail, le temps de travail, la rémunération, la santé au travail, la représentation collective et l’égalité professionnelle.',
  },
  {
    value: '03',
    label: 'Leviers d’action',
    title: 'Agir collectivement',
    text: 'Faire remonter les réalités du terrain, porter des revendications communes et se mobiliser ensemble autour des priorités des salariés.',
  },
]

function PortalStats() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="stats-section" aria-labelledby="stats-title">
      <div className="stats-heading">
        <p className="eyebrow">LE PORTAIL EN CHIFFRES</p>
        <h2 id="stats-title">Des ressources pour<br /><em>faire entendre votre voix.</em></h2>
      </div>
      <div className="stats-accordion">
        {portalStats.map((stat, index) => {
          const isOpen = openIndex === index
          const panelId = `stats-panel-${index}`
          const triggerId = `stats-trigger-${index}`
          return (
            <article className={`stats-item${isOpen ? ' stats-item-open' : ''}`} key={stat.label}>
              <h3>
                <button
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="stats-value">{stat.value}</span>
                  <span className="stats-label">{stat.label}</span>
                  <span className="stats-toggle" aria-hidden="true">
                    <ChevronDown size={18} strokeWidth={1.8} />
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="stats-panel"
              >
                <div>
                  <h4>{stat.title}</h4>
                  <p>{stat.text}</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const portalTabs = [
  { label: 'Le portail', target: 'accueil' },
  { label: 'Actualités', target: 'actualites' },
  { label: 'Vos droits', target: 'droits' },
  { label: 'Nos actions', target: 'agir' },
]

function PortalTabBar() {
  const [activeIndex, setActiveIndex] = useState(0)

  const selectTab = (index: number) => {
    setActiveIndex(index)
    document.getElementById(portalTabs[index].target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? portalTabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + portalTabs.length) % portalTabs.length
    selectTab(nextIndex)
    document.getElementById(`portal-tab-${nextIndex}`)?.focus()
  }

  return (
    <nav className="portal-tabs" data-active={activeIndex} aria-label="Rubriques du portail">
      {portalTabs.map((tab, index) => (
        <button
          id={`portal-tab-${index}`}
          type="button"
          role="tab"
          aria-selected={activeIndex === index}
          tabIndex={activeIndex === index ? 0 : -1}
          className={`portal-tab${activeIndex === index ? ' active' : ''}`}
          key={tab.target}
          onClick={() => selectTab(index)}
          onKeyDown={event => handleKeyDown(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function ActivityDashboardCard() {
  const activity = [
    { month: 'Jan', value: 42 },
    { month: 'Fév', value: 58 },
    { month: 'Mar', value: 51 },
    { month: 'Avr', value: 76 },
    { month: 'Mai', value: 69 },
    { month: 'Jun', value: 88 },
  ]
  const maxValue = Math.max(...activity.map(item => item.value))

  return (
    <section className="dashboard-card-region" aria-labelledby="activity-title">
      <article className="dashboard-card">
        <header className="dashboard-card-header">
          <div>
            <p className="dashboard-kicker">ACTIVITÉ COLLECTIVE</p>
            <h2 id="activity-title">Mobilisations <em>du semestre</em></h2>
          </div>
          <span className="dashboard-period">Jan — Jun 2026</span>
        </header>
        <div className="dashboard-card-body">
          <div className="dashboard-metrics">
            <div className="dashboard-metric dashboard-metric-primary">
              <span className="dashboard-icon"><Users size={17} /></span>
              <div><strong>1 248</strong><small>Participants</small></div>
              <b><TrendingUp size={13} /> +18 %</b>
            </div>
            <div className="dashboard-metric">
              <span>Établissements</span>
              <strong>24</strong>
            </div>
            <div className="dashboard-metric">
              <span>Actions menées</span>
              <strong>36</strong>
            </div>
          </div>
          <div className="dashboard-chart" aria-label="Graphique mensuel de participation">
            {activity.map(item => (
              <div className="dashboard-bar-column" key={item.month}>
                <div className="dashboard-bar-track">
                  <span style={{ height: `${(item.value / maxValue) * 100}%` }} />
                </div>
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  )
}

function ContactForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccessMessage('')

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      company: String(data.get('company') || ''),
      establishment: String(data.get('establishment') || ''),
      subject: String(data.get('subject') || ''),
      message: String(data.get('message') || ''),
      consent: data.get('consent') === 'on',
      website: String(data.get('website') || ''),
    }

    try {
      const response = await fetch(API + '/public/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'L’envoi du formulaire a échoué.')
      form.reset()
      setSuccessMessage(body.notificationSent === false
        ? 'Votre demande est enregistrée, mais l’alerte e-mail n’a pas pu être envoyée. Pour une prise en charge rapide, écrivez directement à contact@focom-iliad.fr.'
        : 'Votre demande a bien été enregistrée et transmise à FOCOM ILIAD.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'L’envoi du formulaire a échoué.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-grid">
        <label>Nom<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Adresse e-mail<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Société<input name="company" autoComplete="organization" maxLength={120} placeholder="Free, ILIAD,..." /></label>
        <label>Établissement<input name="establishment" maxLength={120} /></label>
      </div>
      <label>Sujet
        <select name="subject" required defaultValue="">
          <option value="" disabled>Choisir un sujet</option>
          <option value="rights">Question sur mes droits</option>
          <option value="representation">Contacter un représentant</option>
          <option value="campaign">Revendiquer ou participer à une action</option>
          <option value="membership">Informations sur l’adhésion</option>
          <option value="other">Autre demande</option>
        </select>
      </label>
      <label>Votre message<textarea name="message" required minLength={20} maxLength={3000} rows={6} placeholder="Précisez votre demande et, si utile, votre société et votre établissement." /></label>
      <label className="contact-consent"><input name="consent" type="checkbox" required /><span>J’accepte que les informations saisies soient utilisées uniquement pour traiter cette demande.</span></label>
      <label className="contact-honeypot" aria-hidden="true">Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {error && <p className="contact-form-error" role="alert">{error}</p>}
      {successMessage && <p className={`contact-form-success${successMessage.includes('mais') ? ' contact-form-warning' : ''}`} role="status">{successMessage}</p>}
      <button className="button button-red contact-submit" type="submit" disabled={busy}>{busy ? 'Envoi en cours…' : 'Envoyer ma demande'} <span aria-hidden="true">→</span></button>
    </form>
  )
}

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
        <PortalTabBar />
        <section className="quick-strip" aria-label="Accès rapides">
          <a href="#actualites"><span className="quick-icon">▤</span><span><b>Actualités</b><small>Les informations du groupe</small></span><strong>↗</strong></a>
          <a href="#droits"><span className="quick-icon">§</span><span><b>Vos droits</b><small>Comprendre et connaître</small></span><strong>↗</strong></a>
          <a href="#agir"><span className="quick-icon">✳</span><span><b>Nos revendications</b><small>Nos priorités et nos actions</small></span><strong>↗</strong></a>
          <a href="#contact"><span className="quick-icon">✉</span><span><b>Nous contacter</b><small>Échanger avec FO</small></span><strong>↗</strong></a>
        </section>
        <ActivityDashboardCard />
        <PortalStats />
        <section className="section intro-section" id="groupe">
          <div className="section-heading"><div><p className="eyebrow">UN GROUPE, DES RÉALITÉS</p><h2>Une représentation<br /><em>au plus près du terrain.</em></h2></div><p className="section-lead">Le groupe ILIAD rassemble des activités, des métiers et des équipes aux réalités diverses. FO souhaite rendre l’information syndicale plus accessible et faciliter les échanges entre les salariés et leurs représentants.</p></div>
          <div className="topic-grid">{entities.map((item, i) => <article className="topic-card" key={item.title}><span className="topic-number">0{i + 1}</span><span className="topic-icon">{['◎', '◇', '⌘', '▦'][i]}</span><h3>{item.title}</h3><p>{item.text}</p><a className="card-arrow" href="#representants">En savoir plus <b>↗</b></a></article>)}</div>
          <div className="section-callout"><div><span className="news-label">UNE SECTION DU PORTAIL</span><h3>FOCOM UES ILIAD</h3><p>Retrouvez l’espace dédié à la représentation FO de l’UES ILIAD. Ce site conserve son fonctionnement et son adresse propres.</p></div><a className="button button-red" href="https://focomues-iliad.fr/" target="_blank" rel="noreferrer">Accéder à FOCOM UES ILIAD <span>↗</span></a></div>
          <div className="section-callout section-callout-locked">
            <div>
              <span className="news-label">UNE SECTION DU PORTAIL</span>
              <h3>FO FREE DISTRIBUTION</h3>
              <p>Une section dédiée aux Free Centers du groupe ILIAD, réseau de boutiques de distribution télécom. L’accès est restreint et l’ouverture est prévue prochainement.</p>
            </div>
            <span className="locked-badge"><Lock size={14} /> Accès restreint · Ouverture prochaine</span>
          </div>
        </section>
        <section className="news-section" id="actualites"><div className="section news-inner"><div className="news-heading"><div><p className="eyebrow">RESTER INFORMÉ</p><h2>À la une<span>.</span></h2></div><a className="coming-tag news-all-link" href="/actualites">TOUTES LES ACTUALITÉS ↗</a></div>{latestArticles.length ? <div className="home-news-grid">{latestArticles.map(item => <article className="home-news-card" key={item.id}>{item.cover_image_url && <a href={`/actualites/${item.slug}`}><img src={item.cover_image_url} alt={item.cover_image_alt || ''} loading="lazy" /></a>}<div className="home-news-card-content"><span className="news-label">{item.published_at ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(item.published_at)) : 'FOCOM ILIAD'}</span><h3><a href={`/actualites/${item.slug}`}>{item.title}</a></h3>{item.summary && <p>{item.summary}</p>}<a className="public-read-more" href={`/actualites/${item.slug}`}>Lire l’article ↗</a></div></article>)}</div> : <div className="news-placeholder"><div className="news-placeholder-mark">FO</div><div><span className="news-label">ACTUALITÉS FOCOM</span><h3>Les actualités FO du groupe ILIAD</h3><p>Les dernières publications apparaîtront ici dès leur mise en ligne.</p></div><a className="button button-red" href="/actualites">Consulter les actualités <span>↗</span></a><span className="news-arrow">↗</span></div>}</div></section>
        <section className="section entities-section" id="droits"><div className="section-heading compact"><div><p className="eyebrow">S’INFORMER ET SE DÉFENDRE</p><h2>Vos droits.<br /><em>Vos repères.</em></h2></div><p className="section-lead">Des ressources pour mieux comprendre vos droits au travail. Les règles pouvant varier selon la société, l’établissement et les accords applicables, rapprochez-vous de vos représentants pour une réponse adaptée à votre situation.</p></div><div className="rights-grid">{rights.map((item, i) => <article className="right-card" key={item[0]}><span>0{i + 1} / REPÈRES PRATIQUES</span><h3>{item[0]}</h3><p>{item[1]}</p><a href="#contact">Poser une question <b>↗</b></a></article>)}</div></section>
        <section className="action-section" id="agir"><div className="section"><div className="section-heading"><div><p className="eyebrow">REVENDIQUER ET AGIR</p><h2>Nos droits avancent<br /><em>par l’action collective.</em></h2></div><p className="section-lead">Les revendications FO partent du quotidien des salariés. Informer, consulter, construire des propositions et agir ensemble : chaque voix compte.</p></div><div className="action-grid">{actions.map((item, i) => <article className="action-card" key={item[0]}><span className="action-number">0{i + 1}</span><h3>{item[0]}</h3><p>{item[1]}</p><a href="#contact">Échanger avec FO <b>↗</b></a></article>)}</div></div></section>
        <section className="section reps-section" id="representants"><div className="section-heading"><div><p className="eyebrow">À VOS CÔTÉS</p><h2>Vos représentants<br /><em>FO sur le terrain.</em></h2></div><p className="section-lead">Les interlocuteurs et les périmètres de représentation seront organisés par société et établissement. Pour préserver la confidentialité, les coordonnées personnelles ne seront pas publiées sans accord.</p></div><div className="rep-panel"><div className="rep-mark">FO</div><div><span className="news-label">BESOIN D’UN CONTACT ?</span><h3>Vous souhaitez joindre un représentant FO ?</h3><p>Précisez votre société, votre établissement et l’objet de votre demande. Nous pourrons vous orienter vers le bon interlocuteur.</p></div><a className="button button-red" href="#contact">Nous contacter <span>↗</span></a></div></section>
        <section className="join-band" id="adherer"><div><p className="eyebrow">REJOINDRE FORCE OUVRIÈRE</p><h2>Ne restez pas seul.<br /><em>Faisons entendre votre voix.</em></h2><p>Adhérer, c’est participer à une action collective et renforcer la défense des droits des salariés.</p></div><a className="button button-light" href="#contact">Demander des informations <span>↗</span></a></section>
        <section className="contact-section" id="contact">
          <div className="section contact-inner">
            <div>
              <p className="eyebrow">RESTONS EN CONTACT</p>
              <h2>Une question, une situation,<br /><em>une envie d’agir ?</em></h2>
              <div className="contact-copy">
                <p>Écrivez-nous en indiquant votre société et votre établissement. Un contact téléphonique pourra être nécessaire pour comprendre votre demande.</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <LegalFooter />
    </div>
  )
}
export default App

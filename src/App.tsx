import { useState } from 'react'

const navItems = [
  ['Le groupe', '#groupe'],
  ['Actualités', '#actualites'],
  ['Vos droits', '#droits'],
  ['Revendiquer', '#agir'],
  ['Vos représentants', '#representants'],
]

const topics = [
  { number: '01', title: 'Le groupe ILIAD', description: 'Comprendre le groupe, ses activités et les différents périmètres représentés.', href: '#groupe', icon: '◎' },
  { number: '02', title: 'Vos droits', description: 'Retrouver les informations pratiques, les accords et les ressources utiles.', href: '#droits', icon: '§' },
  { number: '03', title: 'Revendiquer et agir', description: 'Suivre les revendications, les campagnes et les mobilisations collectives.', href: '#agir', icon: '↗' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="site-shell">
      <div className="topline"><span>FORCE OUVRIÈRE</span><span>PORTAIL SYNDICAL DU GROUPE ILIAD</span></div>
      <header className="header">
        <a className="brand" href="#" aria-label="Accueil FOCOM ILIAD">
          <span className="brand-mark"><strong>FO</strong><i>COM</i></span>
          <span className="brand-name">ILIAD<small>LA VOIX DES SALARIÉS</small></span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Ouvrir le menu">☰</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a className="contact-link" href="#contact" onClick={() => setMenuOpen(false)}>Nous contacter <span>↗</span></a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> FORCE OUVRIÈRE · GROUPE ILIAD</p>
            <h1>La voix des salariés.<br /><em>La force du collectif.</em></h1>
            <p className="hero-intro">Un portail pour s'informer, comprendre ses droits et faire entendre les revendications des salariés du groupe ILIAD.</p>
            <div className="hero-actions">
              <a className="button button-red" href="#actualites">Découvrir les actualités <span>→</span></a>
              <a className="text-link" href="#representants">Trouver vos représentants</a>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-top"><span>FO · ILIAD</span><span>ENSEMBLE</span></div>
            <div className="panel-symbol">FO</div>
            <div className="panel-caption">INFORMER<br />DÉFENDRE<br />AGIR</div>
            <div className="panel-bottom"><span>UN PORTAIL · DES ÉQUIPES · UNE MÊME FORCE</span><b>01 / 03</b></div>
          </div>
          <div className="hero-index">01 <span>—</span> LE PORTAIL FO</div>
        </section>

        <section className="quick-strip" aria-label="Accès rapides">
          <a href="#actualites"><span className="quick-icon">▤</span><span><b>Actualités</b><small>Les informations du groupe</small></span><strong>↗</strong></a>
          <a href="#droits"><span className="quick-icon">§</span><span><b>Vos droits</b><small>Comprendre et connaître</small></span><strong>↗</strong></a>
          <a href="#agir"><span className="quick-icon">✳</span><span><b>Nos revendications</b><small>Nos priorités et nos actions</small></span><strong>↗</strong></a>
          <a href="#contact"><span className="quick-icon">✉</span><span><b>Nous contacter</b><small>Échanger avec FO</small></span><strong>↗</strong></a>
        </section>

        <section className="section intro-section" id="groupe">
          <div className="section-heading">
            <div><p className="eyebrow">UN GROUPE, DES RÉALITÉS</p><h2>Une représentation<br /><em>au plus près du terrain.</em></h2></div>
            <p className="section-lead">Le groupe ILIAD rassemble des activités, des métiers et des équipes aux réalités diverses. Ce portail a vocation à rendre l'information syndicale plus accessible et à faciliter les échanges entre les salariés et leurs représentants FO.</p>
          </div>
          <div className="topic-grid">
            {topics.map(topic => <a className="topic-card" href={topic.href} key={topic.number}><span className="topic-number">{topic.number}</span><span className="topic-icon">{topic.icon}</span><h3>{topic.title}</h3><p>{topic.description}</p><span className="card-arrow">Découvrir <b>↗</b></span></a>)}
          </div>
        </section>

        <section className="news-section" id="actualites">
          <div className="section news-inner">
            <div className="news-heading"><div><p className="eyebrow">RESTER INFORMÉ</p><h2>À la une<span>.</span></h2></div><span className="coming-tag">ESPACE ACTUALITÉS</span></div>
            <div className="news-placeholder"><div className="news-placeholder-mark">FO</div><div><span className="news-label">PROCHAINEMENT</span><h3>Les actualités FO du groupe ILIAD</h3><p>Les communications et publications des différentes sections seront réunies ici. Les contenus seront classés par entité et par thème.</p></div><span className="news-arrow">↗</span></div>
          </div>
        </section>

        <section className="section entities-section" id="droits">
          <div className="section-heading compact"><div><p className="eyebrow">S'INFORMER ET SE DÉFENDRE</p><h2>Vos repères.<br /><em>Vos ressources.</em></h2></div><p className="section-lead">Des informations fiables et des ressources pratiques pour accompagner les salariés au quotidien.</p></div>
          <div className="resource-row"><div><span>01 / INFORMATIONS</span><h3>Connaître vos droits</h3><p>Fiches pratiques, accords collectifs et informations sociales.</p></div><a href="#contact" aria-label="En savoir plus sur les droits">↗</a></div>
          <div className="resource-row" id="agir"><div><span>02 / ACTIONS COLLECTIVES</span><h3>Faire entendre vos revendications</h3><p>Priorités syndicales, consultations et mobilisations.</p></div><a href="#contact" aria-label="En savoir plus sur les actions">↗</a></div>
          <div className="resource-row" id="representants"><div><span>03 / PROXIMITÉ</span><h3>Identifier vos représentants FO</h3><p>Retrouver les interlocuteurs selon votre entreprise ou établissement.</p></div><a href="#contact" aria-label="Trouver un représentant">↗</a></div>
        </section>

        <section className="contact-band" id="contact"><div><p className="eyebrow">RESTONS EN CONTACT</p><h2>Une question, une situation,<br /><em>une envie d'agir ?</em></h2></div><a className="button button-light" href="#representants">Trouver un interlocuteur FO <span>↗</span></a></section>
      </main>

      <footer className="footer"><a className="footer-brand" href="#"><span>FO</span> FOCOM ILIAD</a><p>Portail syndical FO du groupe ILIAD · Projet en construction</p><span>© FOCOM ILIAD</span></footer>
    </div>
  )
}

export default App

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type Consent = { essential: true; analytics: boolean; savedAt: string };
const CONSENT_KEY = 'focom-iliad-cookie-consent';

export function SiteUtilities() {
  const [showTop, setShowTop] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [banner, setBanner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 420);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      setBanner(!saved);
    } catch { setBanner(false); }
  }, [location.pathname]);
  useEffect(() => {
    const open = () => openCookieSettings();
    window.addEventListener('focom-open-cookie-settings', open);
    return () => window.removeEventListener('focom-open-cookie-settings', open);
  }, []);

  function saveConsent(analyticsChoice: boolean) {
    const value: Consent = { essential: true, analytics: analyticsChoice, savedAt: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch { /* storage may be disabled */ }
    setBanner(false);
    setShowCookies(false);
  }

  function openCookieSettings() {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) setAnalytics(Boolean((JSON.parse(saved) as Consent).analytics));
    } catch { setAnalytics(false); }
    setShowCookies(true);
  }

  return <>
    {showTop && <button className="back-to-top" type="button" aria-label="Retour en haut de page" title="Haut de page" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑<span>Haut</span></button>}
    <button className="cookie-settings-trigger" type="button" onClick={openCookieSettings}>Cookies</button>
    {banner && <aside className="cookie-banner" role="dialog" aria-label="Choix des cookies">
      <div><strong>Respect de votre vie privée</strong><p>Les cookies strictement nécessaires au fonctionnement du portail sont utilisés. Aucun outil de mesure d’audience facultatif n’est activé actuellement. Vous pouvez consulter notre politique et modifier vos choix à tout moment.</p><Link to="/confidentialite">Politique de confidentialité et cookies</Link></div>
      <div className="cookie-banner-actions"><button type="button" className="cookie-reject" onClick={() => saveConsent(false)}>Tout refuser</button><button type="button" className="cookie-accept" onClick={() => saveConsent(true)}>Tout accepter</button><button type="button" className="cookie-customize" onClick={openCookieSettings}>Personnaliser</button></div>
    </aside>}
    {showCookies && <div className="cookie-modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowCookies(false); }}>
      <section className="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
        <button className="cookie-modal-close" type="button" aria-label="Fermer" onClick={() => setShowCookies(false)}>×</button>
        <p className="eyebrow">VOS PRÉFÉRENCES</p><h2 id="cookie-modal-title">Paramètres des cookies</h2>
        <div className="cookie-choice"><div><strong>Cookies nécessaires</strong><p>Indispensables au fonctionnement et à la sécurité du portail. Ils ne peuvent pas être désactivés.</p></div><span className="cookie-always-on">Toujours actifs</span></div>
        <label className="cookie-choice"><div><strong>Mesure d’audience facultative</strong><p>Autoriser, si un outil de mesure respectueux de la vie privée est activé ultérieurement, le dépôt de cookies associés.</p></div><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label>
        <div className="cookie-modal-actions"><button className="cookie-reject" onClick={() => saveConsent(false)}>Tout refuser</button><button className="cookie-accept" onClick={() => saveConsent(analytics)}>Enregistrer mes choix</button></div>
      </section>
    </div>}
  </>;
}

export function LegalFooter() {
  return <footer className="footer"><Link className="footer-brand" to="/"><img src="/focom-logo.jpg" alt="" /> FOCOM ILIAD</Link><p>Portail syndical FO du groupe ILIAD</p><nav className="legal-footer-links" aria-label="Informations légales"><Link to="/mentions-legales">Mentions légales</Link><Link to="/confidentialite">Confidentialité &amp; RGPD</Link><button type="button" onClick={() => window.dispatchEvent(new Event('focom-open-cookie-settings'))}>Cookies</button></nav><span>© FOCOM ILIAD</span></footer>;
}

export function LegalPage() {
  const location = useLocation();
  const isLegal = location.pathname === '/mentions-legales';
  return <main className="legal-page">
    <Link to="/" className="public-back">← Retour au portail FOCOM ILIAD</Link>
    <p className="eyebrow">FOCOM ILIAD · INFORMATIONS</p>
    <h1>{isLegal ? 'Mentions légales' : 'Confidentialité & RGPD'}</h1>
    {isLegal ? <>
      <section className="legal-identity"><h2>Éditeur du site</h2><p>Ce portail d’information syndicale est édité par FOCOM ILIAD à destination des salariés du groupe ILIAD.</p><div className="legal-info-grid"><div className="legal-info-card"><span>Structure</span><strong>FOCOM ILIAD</strong><small>Syndicat professionnel constitué avec ses propres statuts et ayant fait l’objet d’un dépôt en mairie</small></div><div className="legal-info-card"><span>Adresse</span><strong>16 rue de la Ville-l’Évêque</strong><small>75008 Paris, France</small></div><div className="legal-info-card"><span>Directeur de la publication</span><strong>KENDIRA Fadil</strong></div><div className="legal-info-card"><span>Contact</span><strong><a href="mailto:contact@focom-iliad.fr">contact@focom-iliad.fr</a></strong></div></div></section>
      <section><h2>Hébergement et infrastructure technique</h2><div className="legal-provider-list"><div className="legal-provider-card"><strong>Site web</strong><span>Sevalla, service de Kinsta Inc. — hébergement du site et déploiement.</span><a href="https://sevalla.com/" target="_blank" rel="noreferrer">Site de Sevalla ↗</a></div><div className="legal-provider-card"><strong>API et sécurité réseau</strong><span>Cloudflare, Inc. — exécution de l’API et services d’infrastructure associés.</span><a href="https://www.cloudflare.com/" target="_blank" rel="noreferrer">Site de Cloudflare ↗</a></div><div className="legal-provider-card"><strong>Base de données et authentification</strong><span>Neon, Inc. — base de données et services d’authentification.</span><a href="https://neon.com/" target="_blank" rel="noreferrer">Site de Neon ↗</a></div></div><p className="legal-note">Les lieux précis de traitement et de stockage dépendent des régions configurées auprès de chaque prestataire. Ils doivent être vérifiés dans les consoles et documents contractuels.</p></section>
      <section><h2>Propriété intellectuelle</h2><p>Les contenus, textes, logos et éléments graphiques publiés sur ce portail sont protégés par les règles applicables de propriété intellectuelle. Toute reproduction doit respecter les droits de leurs titulaires et mentionner la source lorsque cela est requis.</p></section>
      <section><h2>Responsabilité</h2><p>Les informations diffusées ont une vocation informative et syndicale. Elles ne remplacent pas l’examen d’une situation individuelle ni les textes légaux, conventionnels ou accords applicables.</p></section>
    </> : <>
      <section><h2>Responsable du traitement</h2><p>Le traitement des données effectué dans le cadre du portail est placé sous la responsabilité de FOCOM ILIAD, sous réserve de la confirmation de son rôle effectif dans la détermination des finalités et des moyens. Pour toute question ou demande relative à vos données personnelles : <a href="mailto:contact@focom-iliad.fr">contact@focom-iliad.fr</a>.</p></section>
      <section><h2>Création et gestion d’un compte</h2><p>La création d’un compte est facultative pour consulter les informations publiques. Lorsqu’un salarié crée un compte, le portail peut traiter les informations nécessaires à sa gestion et à sa sécurisation, notamment son nom ou nom d’affichage, son adresse e-mail, son identifiant de compte et les données techniques de connexion. Le service d’authentification est fourni par Neon. Le mot de passe est géré par ce service et n’a pas vocation à être affiché aux administrateurs du portail.</p><p>Ces informations sont utilisées pour permettre l’accès au compte, gérer les sessions, assurer la sécurité et répondre aux demandes d’assistance.</p></section>
      <section><h2>Questionnaires : participation anonyme ou identifiée</h2><div className="privacy-mode-grid"><div className="privacy-mode-card"><span className="privacy-mode-label">Mode anonyme</span><h3>Répondre sans donner son identité</h3><p>Le questionnaire peut être rempli sans saisir son nom ni son adresse e-mail. Les réponses sont destinées à être exploitées sous forme de résultats et de synthèses qui ne permettent pas d’identifier les répondants.</p></div><div className="privacy-mode-card"><span className="privacy-mode-label">Mode identifié</span><h3>Répondre en communiquant ses coordonnées</h3><p>Lorsque le salarié choisit de renseigner son nom et son adresse e-mail, ces éléments peuvent être associés à sa participation afin de permettre le suivi ou un éventuel échange, selon les indications affichées sur le questionnaire.</p></div></div><p><strong>Important :</strong> le caractère réellement anonyme d’un questionnaire dépend aussi des données techniques enregistrées et de la possibilité de rapprocher une réponse d’un compte ou d’une personne. Tant que cette vérification technique n’est pas achevée, FOCOM ILIAD ne doit pas présenter comme anonymes des réponses qui seraient seulement dépourvues de nom ou d’adresse e-mail. Les réponses identifiables ou pseudonymisées restent des données personnelles.</p></section>
      <section><h2>Catégories de données et précautions</h2><p>Selon les fonctionnalités utilisées, les données susceptibles d’être traitées comprennent les données de compte et de contact, les réponses aux questionnaires, les informations volontairement transmises dans un message ainsi que les données techniques nécessaires au fonctionnement et à la sécurité du portail (par exemple des journaux de connexion).</p><p>Certains questionnaires peuvent porter sur la vie professionnelle ou les revendications syndicales. Évitez d’y inscrire des informations sensibles ou concernant des tiers, sauf si le questionnaire le demande explicitement et explique pourquoi ces informations sont nécessaires.</p></section>
      <section><h2>Finalités et fondements des traitements</h2><ul><li>Créer et administrer les comptes, authentifier les utilisateurs et sécuriser les accès ;</li><li>recueillir et analyser les réponses aux questionnaires afin de comprendre les attentes et préoccupations des salariés ;</li><li>permettre, lorsque le répondant choisit le mode identifié, un éventuel échange en lien avec sa contribution ;</li><li>assurer le fonctionnement, la maintenance et la sécurité du portail.</li></ul><p>Les fondements juridiques applicables doivent être déterminés et documentés par FOCOM ILIAD pour chaque traitement, en fonction de sa finalité et des modalités réelles de collecte. Ils ne sont pas présumés identiques pour les comptes, les questionnaires anonymes et les questionnaires identifiés.</p></section>
      <section><h2>Destinataires et prestataires techniques</h2><p>L’accès aux données est limité aux personnes habilitées qui en ont besoin pour administrer le portail ou traiter les demandes. Le portail s’appuie également sur des prestataires techniques : Neon pour la base de données et l’authentification, Cloudflare pour l’API et l’infrastructure réseau, et Sevalla (service de Kinsta) pour l’hébergement et le déploiement du site.</p><p>Les régions de stockage, les lieux de traitement, les éventuels transferts hors de l’Espace économique européen et les garanties contractuelles doivent être vérifiés dans les paramètres et contrats de chaque prestataire.</p></section>
      <section><h2>Durées de conservation</h2><p>Les données personnelles ne doivent être conservées que pendant une durée nécessaire aux finalités poursuivies. FOCOM ILIAD doit définir et documenter des durées distinctes pour les comptes, les réponses identifiées aux questionnaires, les éventuels messages et les journaux techniques, puis prévoir leur suppression ou leur anonymisation effective à l’échéance.</p><p>Les résultats de questionnaires ne pourront être conservés sans limitation au titre de l’anonymat que si une anonymisation irréversible a réellement été mise en œuvre et empêche toute réidentification.</p></section>
      <section><h2>Cookies et stockage local</h2><p>Le portail utilise des mécanismes techniques nécessaires à l’authentification, au maintien des sessions et à la sécurité. Le choix relatif aux cookies facultatifs est mémorisé dans le stockage local du navigateur. À ce jour, aucun outil facultatif de publicité ou de mesure d’audience n’est déclaré comme activé. Vous pouvez consulter ou modifier votre choix à tout moment depuis le bouton « Cookies ».</p></section>
      <section><h2>Vos droits et leur exercice</h2><p>Dans les conditions prévues par la réglementation, vous pouvez demander l’accès à vos données, leur rectification ou leur effacement, la limitation de certains traitements, vous opposer à certains traitements et, lorsque les conditions sont réunies, demander la portabilité de vos données. Vous pouvez également introduire une réclamation auprès de la CNIL.</p><p>Pour exercer vos droits, écrivez à <a href="mailto:contact@focom-iliad.fr">contact@focom-iliad.fr</a> en précisant votre demande. Pour un questionnaire véritablement anonyme, il peut être impossible de retrouver une réponse individuelle et de la supprimer, puisqu’aucun lien permettant de l’identifier n’est conservé.</p></section>    </>}
    <p className="legal-warning">Page d’information en cours de finalisation : les mentions signalées comme à compléter doivent être validées par l’éditeur avant que ces pages soient considérées comme juridiquement complètes.</p>
  </main>;
}

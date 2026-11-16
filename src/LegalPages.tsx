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
      <section><h2>Éditeur du site</h2><p>Le portail est édité par la structure syndicale FOCOM – Force Ouvrière Communication, pour l’information des salariés du groupe ILIAD.</p><p><strong>Informations juridiques à compléter avant publication définitive :</strong> dénomination légale exacte de l’éditeur, forme juridique, adresse du siège, numéro RNA ou SIREN le cas échéant, adresse électronique de contact et nom du directeur de publication.</p></section>
      <section><h2>Hébergement</h2><p>Le site utilise des services d’hébergement et d’infrastructure fournis notamment par Sevalla et Cloudflare. Les coordonnées légales complètes des prestataires et les lieux d’hébergement doivent être confirmés dans les contrats et paramètres du service avant publication définitive.</p></section>
      <section><h2>Propriété intellectuelle</h2><p>Les contenus, textes, logos et éléments graphiques publiés sur ce portail sont protégés par les règles applicables de propriété intellectuelle. Toute reproduction doit respecter les droits de leurs titulaires et mentionner la source lorsque cela est requis.</p></section>
      <section><h2>Responsabilité</h2><p>Les informations diffusées ont une vocation informative et syndicale. Elles ne remplacent pas l’examen d’une situation individuelle ni les textes légaux, conventionnels ou accords applicables.</p></section>
    </> : <>
      <section><h2>Responsable du traitement</h2><p>Le responsable du traitement doit être identifié par la structure syndicale qui détermine les finalités et les moyens des traitements réalisés via ce portail. Son identité juridique et ses coordonnées de contact restent à compléter.</p></section>
      <section><h2>Données susceptibles d’être traitées</h2><p>Selon les fonctionnalités utilisées, le portail peut traiter les données de compte (nom, adresse e-mail), les données techniques nécessaires à la sécurité et au fonctionnement, ainsi que les informations que vous choisissez de transmettre dans le cadre d’un échange avec les représentants FO.</p><p>Évitez de transmettre des données sensibles ou des informations concernant des tiers qui ne seraient pas nécessaires à votre demande.</p></section>
      <section><h2>Finalités et bases légales</h2><p>Les données de compte servent à créer et sécuriser l’accès à l’espace membre. Les journaux techniques peuvent être utilisés pour assurer la sécurité et prévenir les abus. Toute autre finalité, base légale et durée de conservation devra être précisée avant l’activation de nouveaux formulaires ou services.</p></section>
      <section><h2>Cookies et stockage local</h2><p>Le portail utilise des mécanismes strictement nécessaires à l’authentification et à la sécurité. Le choix relatif aux cookies facultatifs est mémorisé dans le navigateur. À ce jour, aucun outil facultatif de publicité ou de mesure d’audience n’est déclaré comme activé sur le portail. Les choix peuvent être modifiés via le bouton « Cookies » en bas de page.</p></section>
      <section><h2>Vos droits</h2><p>Dans les conditions prévues par le RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou, lorsque cela s’applique, la portabilité de vos données, et vous opposer à certains traitements. Vous pouvez également introduire une réclamation auprès de la CNIL.</p><p>Pour exercer vos droits, contactez le responsable du traitement. <strong>Une adresse de contact dédiée doit être renseignée par l’éditeur avant publication définitive.</strong></p></section>
      <section><h2>Durées de conservation et destinataires</h2><p>Les durées de conservation, les éventuels destinataires, sous-traitants et transferts hors de l’Espace économique européen doivent être documentés précisément par l’éditeur et mis à jour selon les services réellement activés.</p></section>
    </>}
    <p className="legal-warning">Page d’information en cours de finalisation : les mentions signalées comme à compléter doivent être validées par l’éditeur avant que ces pages soient considérées comme juridiquement complètes.</p>
  </main>;
}

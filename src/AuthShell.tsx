import { FormEvent, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient, isAuthConfigured } from './auth-client';
import Portal from './App';

function SessionStatus() {
  if (!authClient) return null;
  return <SessionStatusContent />;
}

function SessionStatusContent() {
  const { data, isPending, error } = authClient!.useSession();
  if (isPending) return <div className="session-status">Vérification de la session…</div>;
  if (error) return <div className="session-status">État de connexion momentanément indisponible.</div>;
  if (!data?.user) return null;
  return (
    <div className="session-status">
      <span>Connecté : <strong>{data.user.name || data.user.email}</strong></span>
      <button type="button" onClick={() => authClient!.signOut()}>Déconnexion</button>
    </div>
  );
}

function AuthNotice({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">ESPACE MEMBRE FOCOM ILIAD</p>
        {children}
        <p className="auth-back"><Link to="/">Retour au portail</Link></p>
      </section>
    </main>
  );
}

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authClient) return;
    setBusy(true); setError('');
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) throw new Error(result.error.message || 'Inscription impossible.');
      sessionStorage.setItem('focom-pending-verification-email', email.trim());
      navigate('/auth/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally { setBusy(false); }
  }

  return (
    <AuthNotice>
      <h1>Créer votre compte</h1>
      <p>Un code de vérification sera envoyé à votre adresse e-mail.</p>
      <form className="focom-auth-form" onSubmit={submit}>
        <label>Nom<input autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Adresse e-mail<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Mot de passe<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Création en cours…' : 'Créer mon compte'}</button>
      </form>
      <p>Vous avez déjà un compte ? <Link to="/auth/sign-in">Se connecter</Link></p>
    </AuthNotice>
  );
}

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => sessionStorage.getItem('focom-pending-verification-email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authClient) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp: otp.trim() });
      if (result.error) throw new Error(result.error.message || 'Code invalide ou expiré.');
      sessionStorage.removeItem('focom-pending-verification-email');
      navigate('/auth/sign-in?verified=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vérification impossible.');
    } finally { setBusy(false); }
  }

  async function resend() {
    if (!authClient || !email.trim()) { setError('Saisissez votre adresse e-mail.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'email-verification' });
      if (result.error) throw new Error(result.error.message || 'Envoi du code impossible.');
      setMessage('Un nouveau code vient d’être envoyé.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally { setBusy(false); }
  }

  return (
    <AuthNotice>
      <h1>Vérifier votre adresse e-mail</h1>
      <p>Saisissez le code reçu par e-mail pour activer votre compte.</p>
      <form className="focom-auth-form" onSubmit={verify}>
        <label>Adresse e-mail<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Code de vérification<input inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="Code reçu par e-mail" /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Vérification…' : 'Vérifier mon adresse'}</button>
      </form>
      <button className="auth-secondary" type="button" onClick={resend} disabled={busy}>Renvoyer un code</button>
      <p><Link to="/auth/sign-in">Retour à la connexion</Link></p>
    </AuthNotice>
  );
}

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authClient) return;
    setBusy(true); setError('');
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        const message = result.error.message || 'Connexion impossible.';
        if (/not verified|unverified|verify email/i.test(message)) {
          sessionStorage.setItem('focom-pending-verification-email', email.trim());
          navigate('/auth/verify-email');
          return;
        }
        throw new Error(message);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally { setBusy(false); }
  }

  return (
    <AuthNotice>
      <h1>Connexion à votre espace</h1>
      <p>Accédez à votre espace personnel FOCOM ILIAD.</p>
      <form className="focom-auth-form" onSubmit={submit}>
        <label>Adresse e-mail<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <p>Pas encore de compte ? <Link to="/auth/sign-up">Créer un compte</Link></p>
      <p><Link to="/auth/verify-email">J’ai déjà reçu un code de vérification</Link></p>
    </AuthNotice>
  );
}

function AuthPage() {
  const { pathname = 'sign-in' } = useParams();
  if (!isAuthConfigured || !authClient) {
    return <AuthNotice><h1>Authentification en cours de configuration</h1><p>L'adresse Neon Auth n'est pas configurée dans le déploiement.</p></AuthNotice>;
  }
  if (pathname === 'sign-up') return <SignUpPage />;
  if (pathname === 'verify-email') return <VerifyEmailPage />;
  return <SignInPage />;
}

function AuthApplication() {
  const navigate = useNavigate();
  if (!authClient) {
    return <Routes><Route path="/auth/:pathname" element={<AuthPage />} /><Route path="*" element={<Portal />} /></Routes>;
  }
  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(href: string) => navigate(href)}
      Link={({ href, children }) => <Link to={href}>{children}</Link>}
      redirectTo="/"
      emailVerification
      signUp={{ fields: ['name'] }}
      localization={{ SIGN_IN: 'Connexion à votre espace', SIGN_UP: 'Créer votre compte' }}
    >
      <SessionStatus />
      <Routes>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="*" element={<Portal />} />
      </Routes>
    </NeonAuthUIProvider>
  );
}

export default function AuthShell() {
  return <BrowserRouter><AuthApplication /></BrowserRouter>;
}

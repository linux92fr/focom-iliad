import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { NeonAuthUIProvider, AuthView } from '@neondatabase/auth/react/ui';
import { authClient, isAuthConfigured } from './auth-client';

function AuthPage() {
  const { pathname = 'sign-in' } = useParams();
  if (!isAuthConfigured || !authClient) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">ESPACE MEMBRE FOCOM ILIAD</p>
          <h1>Authentification en cours de configuration</h1>
          <p>L'adresse Neon Auth sera ajoutée aux paramètres de déploiement du site avant l'ouverture de l'inscription.</p>
          <Link className="button button-red" to="/">Retour au portail</Link>
        </section>
      </main>
    );
  }
  return <AuthView pathname={pathname} />;
}

function AuthApplication() {
  const navigate = useNavigate();

  if (!authClient) {
    return (
      <Routes>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="*" element={<Portal />} />
      </Routes>
    );
  }

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={({ to, replace }) => {
        if (replace) window.history.replaceState({}, '', to);
        else window.history.pushState({}, '', to);
        navigate(to, { replace });
      }}
      Link={({ href, children }) => <Link to={href}>{children}</Link>}
      redirectTo="/"
      emailVerification
      signUp={{ fields: ['name'] }}
      localization={{
        SIGN_IN: 'Connexion à votre espace',
        SIGN_UP: 'Créer votre compte',
        SIGN_IN_DESCRIPTION: 'Accédez à votre espace personnel FOCOM ILIAD.',
        SIGN_UP_DESCRIPTION: 'Créez votre compte avec votre adresse e-mail.',
      }}
    >
      <Routes>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="*" element={<Portal />} />
      </Routes>
    </NeonAuthUIProvider>
  );
}

import Portal from './App';

export default function AuthShell() {
  return (
    <BrowserRouter>
      <AuthApplication />
    </BrowserRouter>
  );
}
